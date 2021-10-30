import Engine from "engine/engine";
import Character, { CharacterParams } from "./character";
import { BOUNDARY, bitStack, colRectRectSizes, GMULTY, GMULTX} from "engine/utilities/math";
import Scene from "engine/scene/scene";
import Animat, { AnimationParams } from "./animation";
import CharacterBin from "./characterbin";
import { Collider } from "engine/modules/collision";

export interface CharacterBotParams extends CharacterParams {
    animsMisc : AnimationInputParams[];
}

export interface AnimationInputParams extends AnimationParams {
    isSliced? : boolean;
}

//Bot parameters
const characterBotOverride = Object.freeze({
    //Main parameters
    height: 4,      //Bot is this tall
    speed : 2.5,    //Bot moves fast
    images : [      //Bot has left & right animations
        { name : "char_bot_left", offsetX : 36 },
        { name : "char_bot_right", offsetX : 14},
        { name : "char_bot_left_armor", offsetX : 36 },
        { name : "char_bot_right_armor", offsetX : 14}],
    frameCount : 10,
    animsCount : 2,

    //Misc animation parameters
    animsMisc : [{ //Bot-bin interaction animation
        images : [{ name : "char_bot_bin", offsetX : 0 }],
        framesSize : 126,
        gposOffset : { x : -1, y : 0},
        zModifier : 150,
        frameCount : 12
    },{             //Bot explosion animation
        images : [{ name : "char_bot_explosion", offsetX : 0 }],
        framesSize : 200,
        gposOffset : { x : -3, y : 0},
        zModifier : 600,
        frameCount : 16,
        isLoop : false
    },{             //Bot up animation
        images : [  //Flying has left & right animations
            { name : "char_bot_fly_left", offsetX : 36 },
            { name : "char_bot_fly_right", offsetX : 14 }],
        speed : 2.5,    //Bot moves fast
        gposOffset : { x : -1, y : 0},
        frameCount : 10,
        animsCount : 2,
        isLoop : true,
        isSliced : true
    },{             //Bot armor animation
        images : [  //Flying has left & right animations
            { name : "char_bot_armor_left", offsetX : 36 },
            { name : "char_bot_armor_right", offsetX : 14 }],
        gposOffset : { x : -1, y : 0},
        frameCount : 12,
        isSliced : true
    }]
});

//Collision bitmasks for bot-brick collisions
const cbc = Object.freeze({
    flor : bitStack([0, 7]),
    down : bitStack([1, 8]),
    ceil : bitStack([2, 9]),
    head : bitStack([3]),
    wall : bitStack([4, 5]),
    step : bitStack([6])
});

export default class CharacterBot extends Character {

    private timer : number = 0;         //Timer to track duration of special movements
    private ceilSubOffset = -6;         //Offset for up/down movement
    private verticalSpeed = 500;
    private isFlight : boolean = false;
    private isArmor : boolean = false;

    protected get animImageIndex() : number { 
        return this.move.x * (this.isArmor ? 2 : 1)
    }

    constructor(engine: Engine, params: CharacterBotParams) {
        super(engine, Object.assign(params, characterBotOverride));

        //Setup miscellaneous animations.
        params.animsMisc.forEach(m => {

            //Build a new animation, store it here and in the scene
            var newIndex = this.animatGroups.push([]) - 1;

            //3 slices if sliced, 1 otherwise
            for(let i = -1; i <= (m.isSliced ? 1 : -1); i ++) {

                this.animatGroups[newIndex].push(new Animat(this.engine, {
                    ...params,
                    speed :      m.speed,
                    images :     m.images,
                    sliceIndex : m.isSliced ? i : null,
                    framesSize : m.isSliced ? GMULTX * 2 : m.framesSize,
                    gposOffset : m.gposOffset,
                    zModifier :  m.isSliced ? (i < 1 ? 300 : 29) : m.zModifier,
                    frameCount : m.frameCount,
                    animsCount : m.animsCount,
                    isLoop :     m.isLoop
                } as AnimationParams));
            }
            this.animatGroups[newIndex].forEach(a => this.parent.pushGO(a));
        });
    }

    //Special movement
    protected handleSpecialMovement(dt : number) {

        this.timer += dt;   //Update timer

        //Perform special movement
        switch(this.animatGroupsIndex) {

            //Vertical movement. flight state will have been set to true by collision
            case 3 : 
                this.moveVertical(dt, this.isFlight ? 1 : -1);
                this.isFlight = false;  //Unset for next collision check
                break;
            
            //Default is do nothing
            default :
                break;
        }

        //If the current animation has ended
        if(this.timer > this.animatGroupCurr[0].duration) {

            switch(this.animatGroupsIndex) {

                //Deactivate this character
                case 2 :
                    this.isActive = false;
                    break;

                //Reset up/down animation
                case 3 :
                    this.timer = 0;
                    this.animatGroupCurr.forEach(a => a.reset());
                    break;
                
                //End animation
                default :
                    this.timer = 0;
                    this.setCurrentGroup(0);
                    break;
            }
        }
    }

    //Vertical motion
    private moveVertical(dt: number, dir: number = 1) {

        //Set subposition to move vertically
        this.spos.y -= dir * dt * this.verticalSpeed;
        
        //If the direction has no obstacles
        if(this.getCollisionVetical(dir)) {

            //If travelled to a new grid position, reset to it.
            if(dir * this.spos.y < -GMULTY + this.ceilSubOffset) {

                this.gpos.y -= dir;             //Go up or down to new grid position
                this.spos.y += dir * GMULTY;    //Reset subposition to match new grid position

                //Update animations to match
                this.animatGroupCurr.forEach(a => {
                    a.gpos.y -= dir;
                    a.zModifierPub = dir > 0 && this.getCollisionVetical(dir) ? 200 : 0; //Z-index fix
                });
            }

            //Update animations to match
            this.animatGroupCurr.forEach(a => a.spos = this.spos);
        }
        //If there is an obstacle
        else {

            //If going upwards, continue to collide with ceiling
            if(dir > 0) {
                this.spos.y = this.ceilSubOffset;
                this.animatGroupCurr.forEach(a => {
                    a.zModifierPub = 0;
                    a.spos.y = this.ceilSubOffset;
                });
            }
            //If going downwards, reset to walking
            else {
                this.timer = 0;
                this.handleBricks(); 
                this.setCurrentGroup(0);
            }
        }
    }

    //Return true if the given vertical direction is free of bricks
    private getCollisionVetical(dir : number) : boolean {

        //If moving upward and hit the ceiling, return false
        if(dir > 0 && this.gpos.y <= this.height + 1) {
            return false;
        }

        //Check for bricks in travelling direction
        return !this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : 1,
                y : dir > 0 ? 1 + this.height : 0
            }), //Position
            0,  //START
            2,  //FINAL
            1,  //HEIGHT
            1); //Direction
    }

    //Check and resolve brick collisions
    protected handleCollision() {

        //Collision bitmask
        const cbm = this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : this.move.x > 0 ? 1 : 0, 
                y : 1 + this.height
            }),             //Position
            5,              //START : n + 1
            15,             //FINAL : (n + 3) * 2 + 1
            7,              //HEIGHT: n + 3
            this.move.x);   //Direction
        
        //WALL BOUNDARY
        if(
            this.gpos.x - 1 < BOUNDARY.minx || 
            this.gpos.x + 1 > BOUNDARY.maxx) {

            this.reverse();
        }
        else {

            //WALL - REVERSE
            if(cbm & cbc.wall) {
                this.reverse();
            }
            //HEAD-WALL - REVERSE
            else if(cbm & cbc.head && cbm & cbc.flor) {
                this.reverse();
            }
            //UP-STEP - GO UP
            else if(cbm & cbc.step) {

                //BLOCKED BY CEILING
                if(cbm & cbc.ceil || this.gpos.y <= BOUNDARY.miny + 3) {
                    this.reverse();
                }
                else {
                    this.gpos.y -= 1;
                }
            }
            //FLOOR - DO NOTHING
            else if(cbm & cbc.flor) {

            }
            //DOWN-STEP - GO DOWN
            else if(cbm & cbc.down) {
                this.gpos.y += 1;
            }
            //VOID - REVERSE
            else {
                this.reverse();
            }
        }
    }

    //Colliders for non-brick collisions
    public getColliders() : Collider[] {
        
        return [{ 
            mask : 0b11111, //All collisions
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0,       //Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        }];
    }

    //Explode
    public resolveCollision(mask : number) {

        //Eat
        if (mask & 0b010) {
            this.setCurrentGroup(1);
        }
        //Hazard
        else if (mask & 0b100 && this.isNormalMovment && !this.isArmor) {
            this.setCurrentGroup(2);
        }
        //Up
        else if (mask & 0b1000) {
            if(this.animatGroupsIndex != 3) {
                this.handleBricks(true);            //Bricks should not be pressured by a floating character
                this.setCurrentGroup(3);            //Play floating animation
                this.spos.x = 0;                    //Force grid alignment
            }
            this.isFlight = true;
        }
        //Armor
        else if (mask & 0b10000) {
            this.isArmor = true;
            this.setCurrentGroup(4);
        }
    }
}