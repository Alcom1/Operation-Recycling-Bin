import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { Collider, Step } from "engine/modules/collision";
import { bitStack, BOUNDARY, GMULTX, GMULTY, MASKS, round } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import { CharacterParams } from "./character";
import CharacterRB from "./characterrb";

enum ClimbState {
    NORMAL,
    UP,
    WAIT,
    HALT,
    DOWN,
    REVERSE
}

const characterRBCOverride = Object.freeze({
    height: 2,
    speed : 2.0,
    images : [
        { name : "char_rbc_left", offsetX : 0 },
        { name : "char_rbc_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true,

    //Misc animation parameters
    animsMisc : [{
        speed : 2.0,
        images : [{ name : "char_rbc_up" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 2.0,
        images : [{ name : "char_rbc_up", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 2.0,
        images : [
            { name : "char_rbc_left", offsetX : 0 },
            { name : "char_rbc_right", offsetX : 0}],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 2.0,
        images : [{ name : "char_rbc_down" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    }]
});

//Collision bitmasks
const gcb = Object.freeze({
    flor : bitStack([9, 10]),
    face : bitStack([5, 7]),
    ceil : bitStack([1, 2]),
    back : bitStack([4, 6]),
    land : bitStack([11]),
    band : bitStack([8])
});

export default class CharacterRBC extends CharacterRB {

    private isStep: boolean = false;
    private vertSpeed : number = 72;
    private ground: number = 0;
    private climbLimit: number = 3;
    private waitCount: number = 0;
    private waitLimit: number;
    private storedCbm: number = 0;  //Store Collision bitmask from collision for later resolution

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBCOverride));

        this.waitLimit = 1 / (params.speed ?? 1);
    }

    public update(dt: number) {
        super.update(dt);
    }

    public handleSpecialMovement(dt : number) {

        switch(this.stateIndex) {

            case ClimbState.UP :
                this.spos.y -= this.vertSpeed * dt;
                break;

            case ClimbState.WAIT :
                this.waitCount += dt;
                if(this.waitCount >= this.waitLimit) {
                    this.waitCount = 0;
                    this.handleCollision();
                }
                break;

            case ClimbState.HALT :
                this.waitCount += dt;
                if(this.waitCount >= this.waitLimit) {
                    this.waitCount = 0;
                    this.handleCollision();
                }
                break;

            case ClimbState.DOWN :
                this.spos.y += this.vertSpeed * dt;
                break;
        }
    }

    //Check and resolve brick collisions
    protected handleCollision() {

        //Reset collision mask
        this.isStep = true;
        this.storedCbm = 0;

        //WALL BOUNDARY
        if (this.gpos.x - 1 < BOUNDARY.minx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.back : gcb.face);
        }        
        else if (this.gpos.x + 2 > BOUNDARY.maxx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.face : gcb.back);
        }
    }

    //Get collision bitmask shared by all collisions here
    private getCollisionBitMask() : number {

        return this.brickHandler.checkCollisionRing(
            this.gpos.getAdd({
                x : -2,
                y : -this.height}),
            4,
            this.move.x);
    }

    //Set current & active group based on the group index
    protected setStateIndex(index? : number) {

        //Store the current ground position if we're starting to go up.
        if(index == ClimbState.UP) {
            this.ground = this.gpos.y;
        }
        
        //Force climb state to match direction. (This is weird.)
        if(index == ClimbState.HALT) {
            this.animations[ClimbState.HALT].forEach(x => x.setImageIndex(this.animImageIndex));
        }

        super.setStateIndex(index);
    }

    //Get passive collider for normal or special movement
    protected getPassiveCollider() : Collider {

        if(this.stateIndex == ClimbState.NORMAL) {

            return super.getPassiveCollider();
        }
        else {

            let climbOffset = this.stateIndex == ClimbState.DOWN ? 2 : 0

            return {
                mask : 0,   //Passive
                min : this.gpos.getAdd({ x : -1, y : climbOffset - this.height}),
                max : this.gpos.getAdd({ x :  1, y : climbOffset})
            }
        }
    }

    //Resolve collisions
    public resolveCollisions(collisions : Collision[], step : Step) {

        if(!this.isStep) {
            return;
        }

        this.isStep = false;

        super.resolveCollisions(collisions, step);

        //Collision bitmask
        this.storedCbm = this.storedCbm | this.getCollisionBitMask();

        switch(this.stateIndex) {

            case ClimbState.NORMAL :
                this.handleCollisionNormal();
                break;

            case ClimbState.UP :
                this.handleCollisionUp();
                break;

            case ClimbState.WAIT :
                this.handleCollisionWait();
                break;            
                
            case ClimbState.HALT :
                this.handleCollisionHalt();
                break;

            case ClimbState.DOWN :
                this.handleCollisionDown();
                break;
        }
    }

    //Collisions for normal movement
    protected handleCollisionNormal() {
        
        //If there is no floor, start going down.
        if(!(this.storedCbm & gcb.flor)) {
            this.setStateIndex(ClimbState.DOWN);
        }
        //Otherwise if there is a wall, try going above it.
        else if((this.storedCbm & gcb.face)) {

            //Blocked by ceiling, reverse
            if(this.storedCbm & gcb.ceil) {

                //Blocked backwards, can't move. Halt.
                if(this.storedCbm & gcb.back) {
                    this.setStateIndex(ClimbState.HALT);
                }
                else {
                    this.reverse();
                }
            }
            //Wait to go up
            else {
                this.setStateIndex(ClimbState.WAIT);
            }
        }
    }

    //Collisions for downward movement
    protected handleCollisionWait() {

        //If there is a ceiling blocking the ascent, return to normal and reverse.
        if(this.storedCbm & gcb.ceil) {
            this.setStateIndex(ClimbState.NORMAL);
            this.reverse();
        }
        //Otherwise, go up.
        else {
            this.setStateIndex(ClimbState.UP);
        }
    }

    //Collisions for downward movement
    protected handleCollisionHalt() {

        //Go down if no floor
        if(!(this.storedCbm & gcb.flor)) {

            this.setStateIndex(ClimbState.DOWN);
        }
        //Otherwise go forward if no forward wall
        else if(!(this.storedCbm & gcb.face)) {

            this.setStateIndex(ClimbState.NORMAL);
        }
        //Otherwise go up if forward wall but no ceiling
        else if(!(this.storedCbm & gcb.ceil)) {

            this.setStateIndex(ClimbState.WAIT);
        }
        //Otherwise go backwards if there is no wall behind
        else if(!(this.storedCbm & gcb.back)) {

            this.reverse();
            this.setStateIndex(ClimbState.NORMAL);
        }
        //Otherwise remain halted
        else {

            this.reverse();
            this.setStateIndex(ClimbState.HALT);
        }
    }

    //Collisions for downward movement
    protected handleCollisionUp() {

        //If forward landing is available, move forward
        if(!(this.storedCbm & gcb.face) && (this.storedCbm & gcb.land)) {
            this.setStateIndex(ClimbState.NORMAL);
        }
        //Otherwise if forward landing is available behind, move backward
        else if(!(this.storedCbm & gcb.back) && (this.storedCbm & gcb.band)) {
            this.setStateIndex(ClimbState.NORMAL);
            this.reverse();
        }
        //Otherwise if there is a ceiling or the climbing limit is reached, start moving back down.
        else if(this.storedCbm & gcb.ceil || this.ground - this.gpos.y >= this.climbLimit) {
            this.setStateIndex(ClimbState.DOWN);
        }
    }

    //Collisions for upward movement
    protected handleCollisionDown() {

        //If there is a floor, land.
        if(this.storedCbm & gcb.flor) {

            //If there is a wall in the way while landing, turn around
            if(this.storedCbm & gcb.face) {

                //If there is a wall in the other direction, attempt to go up.
                if(this.storedCbm & gcb.back) {

                    //If the ceiling has suddenly been blocked, HALT. Otherwise, wait to go back up.
                    if(this.storedCbm & gcb.ceil) {
                        this.setStateIndex(ClimbState.HALT);
                    }
                    else {
                        this.setStateIndex(ClimbState.WAIT);
                    }
                }
                else {
                    this.setStateIndex(ClimbState.NORMAL);
                    this.reverse();
                }
            }
            //Oterwise, continue forward
            else {
                this.setStateIndex(ClimbState.NORMAL);
            }
        }
    }

    //Add additional bitmasks from character collisions
    public resolveCollision(mask : number, other : GameObject) {

        if (mask & (MASKS.enemy | MASKS.block)) {

            const diff = other.gpos
                .getSub(this.gpos)  //Difference between positions
                .getAdd({           
                    x : Math.sign(other.spos.x),
                    y : Math.sign(other.spos.y)
                });
            
            //Face blocked by character
            if(Math.abs(diff.y) < 2 && Math.abs(diff.x) <= 2) {

                //In front
                if(Math.sign(diff.x) == this.move.x) {
                    this.storedCbm = this.storedCbm | gcb.face;
                }
                //Behind
                else {
                    this.storedCbm = this.storedCbm | gcb.back;
                }
            }
            //Ceiling blocked by character
            if(Math.abs(diff.x) < 2 && diff.y < 0 && diff.y >= -2) {
                this.storedCbm = this.storedCbm | gcb.ceil;
            }
            //Floor blocked by character
            if(Math.abs(diff.x) < 2 && diff.y > 0 && diff.y <= 2) {
                this.storedCbm = this.storedCbm | gcb.flor;
            }
        }
    }
}