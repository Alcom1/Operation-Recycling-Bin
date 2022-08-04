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
    speed : 3.0,
    images : [
        { name : "char_rbc_left", offsetX : 0 },
        { name : "char_rbc_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true,

    //Misc animation parameters
    animsMisc : [{
        speed : 3.0,
        images : [{ name : "char_rbc_up" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 3.0,
        images : [{ name : "char_rbc_up", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 3.0,
        images : [
            { name : "char_rbc_left", offsetX : 0 },
            { name : "char_rbc_right", offsetX : 0}],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 3.0,
        images : [{ name : "char_rbc_down" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    }]
});

//Collision bitmasks
const gcb = Object.freeze({
    flor : bitStack(9, 10),
    face : bitStack(5, 7),
    ceil : bitStack(1, 2),
    back : bitStack(4, 6),
    land : bitStack(11),
    band : bitStack(8)
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
                break;

            case ClimbState.HALT :
                break;

            case ClimbState.DOWN :
                this.spos.y += this.vertSpeed * dt;
                break;
        }
    }

    //Check and resolve brick collisions
    protected handleStep() {

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

        //Collision bitmask
        this.storedCbm = this.storedCbm | this.getCollisionBitMask();

        switch(this.stateIndex) {

            case ClimbState.NORMAL :
                this.gpos.x += this.move.x;
                this.handleStepNormal();
                break;

            case ClimbState.UP :
                this.handleStepUp();
                break;

            case ClimbState.WAIT :
                this.handleStepWait();
                break;            
                
            case ClimbState.HALT :
                this.handleStepHalt();
                break;

            case ClimbState.DOWN :
                this.handleStepDown();
                break;
        }
    }

    //Get collision bitmask shared by all collisions here
    private getCollisionBitMask() : number {

        return this.brickHandler.checkCollisionRing(
            this.gpos.getAdd({
                x : 0,
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
        
        super.resolveCollisions(collisions, step);
    }

    //Collisions for normal movement
    protected handleStepNormal() {
    }

    //Collisions for downward movement
    protected handleStepWait() {
    }

    //Collisions for downward movement
    protected handleStepHalt() {
    }

    //Collisions for downward movement
    protected handleStepUp() {
    }

    //Collisions for upward movement
    protected handleStepDown() {
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