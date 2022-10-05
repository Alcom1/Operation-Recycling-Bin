import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { FOUR_BITSTACK as gcb, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

enum ClimbState {
    NORMAL,
    UP,
    WAIT,
    HALT,
    DOWN,
    REVERSE
}

const CharacterGearClimbOverride = Object.freeze({
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

export default class CharacterGearClimb extends CharacterGear {

    private vertSpeed : number = 108;
    private vertMax :   number = 3;
    private vertCount : number = 0;

    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearClimbOverride));
    }

    //Update position to move forward
    protected updatePosition() {

        //Move in different directions based on state
        switch(this.stateIndex) {

            //Move forward, please.
            case ClimbState.NORMAL : 
                this.gpos.x += this.move.x;
                break;

            //Move up
            case ClimbState.UP : 
                this.gpos.y -= 1;
                this.vertCount ++;
                break;

            //Move down
            case ClimbState.DOWN : 
                this.gpos.y += 1;
                break;
        }
    }

    //
    protected handleSpecialMovement(dt: number) {
        
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

    //Resolve collisions based on the current stored bitmask
    public resolveCollisionBitmask() {

        switch(this.stateIndex) {
    
            case ClimbState.NORMAL :
                this.resolveCollisionsNormal();
                break;

            case ClimbState.UP :
                this.resolveCollisionsUp();
                break;

            case ClimbState.WAIT :
                break;

            case ClimbState.HALT :
                break;

            case ClimbState.DOWN :
                this.resolveCollisionsDown();
                break;
        }
    }

    //Index reset with unique behaviors
    public setStateIndex(index? : number) {
        this.vertCount = 0;         //Reset vertical counter
        super.setStateIndex(index); //Set index
    }

    //Resolve collisions for normal movement
    public resolveCollisionsNormal() {

        //Go down for cliffs
        if(!(this.storedCbm & gcb.flor)) {
            this.setStateIndex(ClimbState.DOWN);
        }
        //Go up for walls
        else if(this.storedCbm & gcb.face) {

            //Unless there's an immediate ceiling, then reverse instead
            if(this.storedCbm & gcb.ceil) {
                this.reverse();
            }
            //actually go up
            else {
                this.setStateIndex(ClimbState.UP);
            }
        }
    }

    //Resolve collisions for upward movement
    public resolveCollisionsUp() {

        //Go forward if an opening is available
        if(!(this.storedCbm & gcb.face)) {
            this.setStateIndex(ClimbState.NORMAL);
        }
        //Go back down if a ceiling is hit, or if the height limit is reached
        else if(this.storedCbm & gcb.ceil || this.vertCount >= this.vertMax) {
            this.setStateIndex(ClimbState.DOWN);
        }
    }

    //Resolve collisions for downward movement
    public resolveCollisionsDown() {

        //Land & return to normal movement if there is a floor
        if(this.storedCbm & gcb.flor) {
            this.setStateIndex(ClimbState.NORMAL);

            //Reverse if there is wall ahead upon landing
            if(this.storedCbm & gcb.face) {
                this.reverse();
            }
        }
    }

    //Store front collisions in bitmask
    public resolveCollision(mask : number, other : GameObject) {

        //Block face if there's something in front
        if (mask & (MASKS.enemy | MASKS.block)){

            var targetDir = Math.sign(other.gpos.x - this.gpos.x)   //Direction of the target
            var facingDir = Math.sign(this.move.x);                 //Direction of this's movement

            if(targetDir == facingDir) {
                this.storedCbm |= gcb.face;
            }
        }
    }
}