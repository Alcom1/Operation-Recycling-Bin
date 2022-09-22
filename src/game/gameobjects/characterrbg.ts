import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { FOUR_BITSTACK as gcb, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterRB from "./characterrb";

const characterRBGOverride = Object.freeze({
    height: 2,
    speed : 5.0,
    images : [        
        { name : "char_rbg_left", offsetX : 0 },
        { name : "char_rbg_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true
});

export default class CharacterRBG extends CharacterRB {

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBGOverride));
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
            else if(!(this.storedCbm & gcb.land)) {
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