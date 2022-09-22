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

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBCOverride));
    }

    //Update position to move forward
    protected updatePosition()
    {
        //Move forward, please.
        this.gpos.x += this.move.x;
    }

    public resolveCollisions(collisions : Collision[]) {

        if(this.isStep)
        {
            this.isStep = false;
            super.resolveCollisions(collisions);
        
            //Brick collisions
            if(this.storedCbm & gcb.face) {
                this.reverse();
            }
            //
            else if(!(this.storedCbm & gcb.flor)) {
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