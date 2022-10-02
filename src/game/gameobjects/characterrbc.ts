import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { FOUR_BITSTACK as gcb, MASKS } from "engine/utilities/math";
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

export default class CharacterRBC extends CharacterRB {

    private vertSpeed : number = 72;

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBCOverride));
    }

    //Update position to move forward
    protected updatePosition()
    {
        //Move in different directions based on state
        switch(this.stateIndex) {

            //Move forward, please.
            case ClimbState.NORMAL : 
                this.gpos.x += this.move.x;
                break;

            //Move up
            case ClimbState.UP : 
                this.gpos.y -= 1;
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

    //
    public resolveCollisions(collisions : Collision[]) {

        //
        if(this.isStep)
        {
            this.isStep = false;
            super.resolveCollisions(collisions);

            switch(this.stateIndex) {
    
                case ClimbState.NORMAL :
                    this.resolveCollisionsNormal();
                    break;
            }
        }
    }

    //
    public resolveCollisionsNormal()
    {
        //Brick collisions
        //Reverse for walls
        if(this.storedCbm & gcb.face) {
            this.reverse();
        }
        //Reverse for cliffs
        else if(!(this.storedCbm & gcb.flor)) {
            this.setStateIndex(ClimbState.DOWN)
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