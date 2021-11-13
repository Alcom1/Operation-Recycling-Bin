import Character, { CharacterParams } from "./character";
import { BOUNDARY, bitStack, GMULTY, GMULTX} from "engine/utilities/math";
import Animat, { AnimationParams } from "./animation";
import { Collider } from "engine/modules/collision";
import { Point } from "engine/utilities/vect";

interface CharacterBotParams extends CharacterParams {
    animsMisc : AnimationInputParams[];
}

interface AnimationInputParams extends AnimationParams {
    isSliced? : boolean;
}

enum ArmorState {
    NONE,
    ACTIVE,
    FLASH
}

enum AirState {
    NONE,
    JUMP,
    UPWARD
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
        images : [{ name : "char_bot_bin" }],
        gposOffset : { x : -1, y : 0},
        zModifier : 150,
        frameCount : 12
    },{             //Bot explosion animation
        images : [{ name : "char_bot_explosion" }],
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
const gcb = Object.freeze({
    flor : bitStack([0, 7]),
    down : bitStack([1, 8]),
    ceil : bitStack([2, 9]),
    head : bitStack([3]),
    wall : bitStack([4, 5]),
    step : bitStack([6])
});

const acb = Object.freeze({
    flor : bitStack([0, 6]),
    head : bitStack([1]),
    face : bitStack([8, 9]),
    chin : bitStack([10, 11])
});

export default class CharacterBot extends Character {

    private timerSpc : number = 0;                          //Timer to track duration of special movements
    private timerArm : number = 0;                          //Timer to track armor flash
    private ceilSubOffset : number = -6;                    //Offset for up/down movement
    private vertSpeed : number = 500;                       //Speed of air movement
    private horzSpeed : number = 350;                       //Horizontal air speed
    private jumpHeights : number[] = [0, 2, 3, 3, 2, 0];    //Individual heights throughout a jump
    private jumpOrigin : Point = { x : 0, y : 0 }           //Origin of the previous jump
    private airState : AirState = AirState.NONE;            //If currently flying
    private armorDelay : number = 2;                        //Delay where armor remains after taking damage
    private armorFlashRate : number = 8;                    //Rate of the armor flashing effect
    private armorState : ArmorState = ArmorState.NONE;      //Current state of the armor

    protected get animImageIndex() : number { 
        return this.move.x * (
            this.armorState == ArmorState.ACTIVE ? 2 :
            this.armorState == ArmorState.FLASH  ? (1 + Math.floor(this.timerArm * this.armorFlashRate) % 2) : 
            1)
    }

    constructor(params: CharacterBotParams) {
        super(Object.assign(params, characterBotOverride));

        //Setup miscellaneous animations.
        params.animsMisc.forEach(m => {

            //Build a new animation, store it here and in the scene
            var newIndex = this.animatGroups.push([]) - 1;

            //3 slices if sliced, 1 otherwise
            for(let i = -1; i <= (m.isSliced ? 1 : -1); i ++) {

                this.animatGroups[newIndex].push(new Animat({
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

    //Unique bot update
    public update(dt : number) {
        super.update(dt);

        //Update armor flash
        if(this.armorState == ArmorState.FLASH) {
            this.timerArm += dt;
            this.animatGroupCurr.forEach(x => x.setImageIndex(this.animImageIndex));

            //Remove armor after a duration and reset timer
            if(this.timerArm > this.armorDelay) {
                this.armorState = ArmorState.NONE;
                this.timerArm = 0;
            }
        }
    }

    //Special movement
    protected handleSpecialMovement(dt : number) {

        this.timerSpc += dt;   //Update special timer

        //Perform special movement
        switch(this.animatGroupsIndex) {

            //Vertical movement.
            case 3 : 
                
                //Bot is jumping
                if(this.airState == AirState.JUMP) {
                    this.moveJump(dt);
                }
                //Bot is moving vertically
                else {

                    this.moveVertical(dt, this.airState == AirState.UPWARD ?  1 : -1);
                    this.airState = AirState.NONE;  //Unset for next collision check, UPWARD requires constant collision
                }
                break;
            
            //Default is do nothing
            default :
                break;
        }

        //If the current animation has ended
        if(this.timerSpc > this.animatGroupCurr[0].duration) {

            //Reset timer
            this.timerSpc = 0;

            switch(this.animatGroupsIndex) {

                //Deactivate this character
                case 2 :
                    this.isActive = false;
                    break;

                //Reset up/down animation
                case 3 :
                    this.animatGroupCurr.forEach(a => a.reset());
                    break;
                
                //End animation
                default :
                    this.setCurrentGroup(0);
                    break;
            }
        }
    }

    //Move in a jumping arc
    private moveJump(dt: number) {

        var index = Math.abs(this.gpos.x - this.jumpOrigin.x);  //Index of current jump height

        //Collision bitmask
        const cbm = this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : this.move.x > 0 ? 1 : 0, 
                y : this.height + 1
            }),             //Position
            this.move.x,    //Direction
            5,              //START  n + 1
            17,             //FINAL
            6,              //HEIGHT n + 2
            3);             //Width
        
        //Collide face if we're over half-way past the first step
        if(cbm & acb.face && (index > 0 || Math.abs(this.spos.x) > GMULTX / 2)) {
            this.startVertMovement();
            return;
        }
        //collide chin after the first step
        else if (cbm & acb.chin && index > 0) {
            this.startVertMovement();
            return;
        }
        //Collide head unless we're at the peak of the jump
        else if (cbm & acb.head && this.jumpHeights[index] < Math.max(...this.jumpHeights)) {
            this.startVertMovement();
            return;
        }
        //Collide with floor after the first step
        else if (cbm & acb.flor && index > 0) {
            this.endAirMovement();
            return;
        }

        //End of jump
        if(index > this.jumpHeights.length - 2) {
            this.startVertMovement();
            return;
        }

        //Update position, travel in an arc based on the jump heights.
        this.spos.x += this.move.x * this.horzSpeed * dt;       //Update horizontal position
        this.spos.y = - GMULTY * (                              //Update vertical position
            this.jumpHeights[index] + 
            this.gpos.y - 
            this.jumpOrigin.y +
            Math.abs(this.spos.x / GMULTX) * (this.jumpHeights[index + 1] - this.jumpHeights[index]));

        this.animatGroupCurr.forEach(a => a.spos = this.spos);  //Update animations to match current position
    }

    //Vertical motion
    private moveVertical(dt: number, dir: number) {

        this.spos.y -= dt * this.vertSpeed * dir;   //Move subposition vertically based on speed
        
        //If the direction has no obstacles
        if (this.getCollisionVertical(dir)) {
            this.animatGroupCurr.forEach(a => a.spos = this.spos);
        }
        //There is an obstacle, stop based on its direction
        else {

            //If going upwards, collide with ceiling
            if(dir > 0) {
                this.spos.y = this.ceilSubOffset;
                this.animatGroupCurr.forEach(a => {
                    a.zModifierPub = 0;
                    a.spos.y = this.ceilSubOffset;
                });
            }
            //If going downwards, reset to walking
            else {
                this.endAirMovement();
            }
        }
    }

    //Quickly shift fight to 
    private startVertMovement() {
        this.airState = AirState.UPWARD;
        this.spos.x = 0;
    }

    //End vertical or jump movement
    private endAirMovement() {

        this.airState = AirState.NONE;
        this.spos.x = 0;
        this.timerSpc = 0;
        this.handleBricks(); 
        this.setCurrentGroup(0);
    }

    //Return true if the given vertical direction is free of bricks
    private getCollisionVertical(dir : number) : boolean {

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
            1,  //Direction
            0,  //START
            2,  //FINAL
            1); //HEIGHT
            
    }

    //Check and resolve brick collisions
    protected handleCollision() {
        
        //WALL BOUNDARY
        if(
            this.gpos.x - 1 < BOUNDARY.minx || 
            this.gpos.x + 1 > BOUNDARY.maxx) {

            this.reverse();
        }
        //Brick collisions
        else {

            //Collision bitmask
            const cbm = this.brickHandler.checkCollisionRange(
                this.gpos.getSub({
                    x : this.move.x > 0 ? 1 : 0, 
                    y : 1 + this.height
                }),             //Position
                this.move.x,    //Direction
                5,              //START :  n + 1
                15,             //FINAL : (n + 3) * 2 + 1
                7);             //HEIGHT:  n + 3

            //WALL - REVERSE
            if(cbm & gcb.wall) {
                this.reverse();
            }
            //HEAD-WALL - REVERSE
            else if(cbm & gcb.head && cbm & gcb.flor) {
                this.reverse();
            }
            //UP-STEP - GO UP
            else if(cbm & gcb.step) {

                //BLOCKED BY CEILING
                if(cbm & gcb.ceil || this.gpos.y <= BOUNDARY.miny + 3) {
                    this.reverse();
                }
                else {
                    this.gpos.y -= 1;
                }
            }
            //FLOOR - DO NOTHING
            else if(cbm & gcb.flor) {

            }
            //DOWN-STEP - GO DOWN
            else if(cbm & gcb.down) {
                this.gpos.y += 1;
            }
            //VOID - REVERSE
            else {
                this.reverse();
            }
        }
    }

    //Set bot to a flight state
    private setFlightState(state : AirState) {

        this.airState = state;
        this.jumpOrigin = this.gpos.get();

        if(this.animatGroupsIndex != 3) {
            this.handleBricks(true);    //Bricks should not be pressured by a floating character
            this.setCurrentGroup(3);    //Play floating animation
            this.spos.x = 0;            //Force grid alignment
        }
    }

    //Colliders for non-brick collisions
    public getColliders() : Collider[] {
        
        return [{ 
            mask : 0b1111, //All collisions
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0,       //Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0b1010000, //Armor & Jump collides with legs
            min : this.gpos.getAdd({ x : -1 - Math.min(this.move.x, 0), y : 0}),
            max : this.gpos.getAdd({ x :    - Math.min(this.move.x, 0), y : 1}) 
        }];
    }

    //Explode
    public resolveCollision(mask : number) {

        //Eat
        if (mask & 0b010) {
            this.setCurrentGroup(1);
        }
        //Hazard
        else if (mask & 0b100 && this.isNormalMovment) {

            //Start flashing animation after taking damage
            if(this.armorState == ArmorState.ACTIVE) {
                this.armorState = ArmorState.FLASH
            }
            //If unarmored, die.
            else if(this.armorState == ArmorState.NONE) {
                this.setCurrentGroup(2);
            }
        }
        //Up
        else if (mask & 0b1000) {
            this.setFlightState(AirState.UPWARD)
        }
        //Armor
        else if (mask & 0b10000) {
            this.armorState = ArmorState.ACTIVE;
            this.setCurrentGroup(4);
        }
        //Flight
        else if (mask & 0b1000000) {
            this.setFlightState(AirState.JUMP)
        }
    }
}