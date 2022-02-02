import Character, { CharacterParams } from "./character";
import { BOUNDARY, bitStack, GMULTY, GMULTX, MASKS} from "engine/utilities/math";
import { Collider } from "engine/modules/collision";
import { Point } from "engine/utilities/vect";

enum ArmorState {
    NONE,
    ACTIVE,
    FLASH
}

//Bot parameters
const characterBotOverride = Object.freeze({
    //Main parameters
    height: 4,      //Bot is this tall
    speed : 3,      //Bot moves fast
    images : [      //Bot has left & right animations
        { name : "char_bot_left", offsetX : 36 },
        { name : "char_bot_right", offsetX : 14},
        { name : "char_bot_left_armor", offsetX : 36 },
        { name : "char_bot_right_armor", offsetX : 14}],
    frameCount : 10,
    animsCount : 2,
    stateAnimations : [1, 2, 3, 3, 4],

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

//Collision bitmasks for bot-brick collisions in air
const acb = Object.freeze({
    flor : bitStack([0, 6]),
    head : bitStack([1, 7]),
    face : bitStack([8, 9, 10]),
    shin : bitStack([11]),
    foot : bitStack([12])
});

export default class CharacterBot extends Character {

    private timerSpc : number = 0;                          //Timer to track duration of special movements
    private timerArm : number = 0;                          //Timer to track armor flash
    private ceilSubOffset : number = -6;                    //Offset for up/down movement
    private vertSpeed : number = 500;                       //Speed of air movement
    private vertMult : -1|1 = 1;                            //Up/Down multiplier for air movement
    private horzSpeed : number = 350;                       //Horizontal air speed
    private jumpHeights : number[] = [0, 2, 3, 3, 2, 0];    //Individual heights throughout a jump
    private jumpOrigin : Point = { x : 0, y : 0 }           //Origin of the previous jump
    private armorDelay : number = 2;                        //Delay where armor remains after taking damage
    private armorFlashRate : number = 8;                    //Rate of the armor flashing effect
    private armorState : ArmorState = ArmorState.NONE;      //Current state of the armor

    protected get animImageIndex() : number { 
        return this.move.x * (
            this.armorState == ArmorState.ACTIVE ? 2 :
            this.armorState == ArmorState.FLASH  ? (1 + Math.floor(this.timerArm * this.armorFlashRate) % 2) : 
            1)
    }

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterBotOverride));
    }

    //Unique bot update
    public update(dt : number) {
        super.update(dt);

        //Update armor flash
        if(this.armorState == ArmorState.FLASH) {
            this.timerArm += dt;
            this.animationsCurr.forEach(x => x.setImageIndex(this.animImageIndex));

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
        switch(this.stateIndex) {

            //Vertical
            case 3 : 
                this.moveVertical(dt, this.vertMult);
                this.vertMult = -1;
                break;

            //Jump
            case 4 :
                this.moveJump(dt);
                break;

            //Default is do nothing
            default :
                break;
        }

        //If the current animation has ended
        if(this.timerSpc > this.animationsCurr[0].duration) {

            //Reset timer
            this.timerSpc = 0;

            switch(this.stateIndex) {

                //Deactivate this character
                case 2 :
                    this.isActive = false;
                    break;

                //Reset up/down animation
                case 3 :
                    this.animationsCurr.forEach(a => a.reset());
                    break;

                //Do nothing for jump
                case 4 :
                    break;
                
                //End animation
                default :
                    this.setStateIndex(0);
                    break;
            }
        }
    }

    //Move in a jumping arc
    private moveJump(dt: number) {

        var index = Math.abs(this.gpos.x - this.jumpOrigin.x);  //Index of current jump height

        //Don't jump past the level boundary
        if ((index > 0 || Math.abs(this.spos.x) > GMULTX / 2) && (
            this.gpos.x - 2 < BOUNDARY.minx || 
            this.gpos.x + 2 > BOUNDARY.maxx)) {

            this.startVertMovement();
            return;
        }

        //Collision bitmask
        const cbm = this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : this.move.x > 0 ? 1 : 0, 
                y : this.height + 1
            }),             //Position
            this.move.x,    //Direction
            5,              //START  n + 1
            18,             //FINAL
            6,              //HEIGHT n + 2
            3);             //Width
        
        //Collide face if we're over half-way past the first step
        if(cbm & acb.face && (index > 0 || Math.abs(this.spos.x) > GMULTX / 2)) {
            this.startVertMovement();
            return;
        }
        //Collide head if not at the peak of the jump
        else if((cbm & acb.head || this.gpos.y <= BOUNDARY.miny + 3) && index < 2) {
            this.startVertMovement();
            return;
        }
        //collide shin after the first step
        else if (cbm & acb.shin && index > 0) {
            this.startVertMovement();
            return;
        }
        //Collide with foot after the arc starts travelling downwards
        else if (cbm & acb.foot && index > 2) {
            this.startVertMovement();
            return;
        }
        //Collide with floor after the first step
        else if (cbm & acb.flor && index > 0) {
            this.endVertMovement();
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

        this.animationsCurr.forEach(a => a.spos = this.spos);  //Update animations to match current position
    }

    //Vertical motion
    private moveVertical(dt: number, dir: number) {

        
        //If the direction has no obstacles
        if (this.getCollisionVertical(dir)) {

            this.spos.y -= dt * this.vertSpeed * dir;   //Move subposition vertically based on speed
            this.animationsCurr.forEach(a => a.spos = this.spos);
        }
        //There is an obstacle, stop based on its direction
        else {

            //If going upwards, collide with ceiling
            if(dir > 0) {
                this.spos.y = this.ceilSubOffset;
                this.animationsCurr.forEach(a => {
                    a.zModifierPub = 0;
                    a.spos.y = this.ceilSubOffset;
                });
            }
            //If going downwards, reset to walking
            else {
                this.endVertMovement();
            }
        }
    }

    //Quickly shift fight to 
    private startVertMovement() {
        this.vertMult = -1;
        this.setStateIndex(3);
        this.spos.x = 0;
    }

    //End vertical or jump movement
    private endVertMovement() {

        this.spos.setToZero();
        this.handleBricks();

        //Go from air state to walking state.
        this.setStateIndex(0);
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
        if (this.gpos.x - 1 < BOUNDARY.minx || 
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

    //Colliders for non-brick collisions
    public getColliders() : Collider[] {
        
        return [{ 
            mask : MASKS.scrap | MASKS.death | MASKS.float,
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0,       //Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : MASKS.super | MASKS.jumps | MASKS.press,
            min : this.gpos.getAdd({ x : -1 - Math.min(this.move.x, 0), y : 0}),
            max : this.gpos.getAdd({ x :    - Math.min(this.move.x, 0), y : 1}) 
        }];
    }

    //Also reset timer when setting the current group
    public setStateIndex(index? : number) {

        //Only set state if it's different from the current
        if(this.stateIndex != index) {

            this.timerSpc = 0;  //Timer reset incase we cancelled a previous animation
            super.setStateIndex(index);
            return; 
        }
    }

    //Collisions
    public resolveCollision(mask : number) {

        //Eat
        if (mask & MASKS.scrap) {
            this.setStateIndex(1);
        }
        //Hazard
        else if (mask & MASKS.death && this.stateIndex != 2) {

            //Start flashing animation after taking damage
            if(this.armorState == ArmorState.ACTIVE) {
                this.armorState = ArmorState.FLASH
            }
            //If unarmored, die.
            else if(this.armorState == ArmorState.NONE) {
                this.setStateIndex(2);
            }
        }
        //Vertical
        else if (mask & MASKS.float) {
            this.vertMult = 1;
            this.handleBricks(true); 
            this.setStateIndex(3);
        }
        //Jump
        else if (mask & MASKS.jumps) {
            this.jumpOrigin = this.gpos.get();
            this.setStateIndex(4);
        }
        //Armor
        else if (mask & MASKS.super) {
            this.armorState = ArmorState.ACTIVE;
            this.setStateIndex(5);
        }
    }
}