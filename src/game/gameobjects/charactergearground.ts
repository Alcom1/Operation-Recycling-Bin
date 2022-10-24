import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

const CharacterGearGroundOverride = Object.freeze({
    height: 2,
    speed : 5.0,
    images : [        
        { name : "char_rbg_left", offsetX : 0 },
        { name : "char_rbg_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true
});

export default class CharacterGearGround extends CharacterGear {

    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearGroundOverride));
    }

    //Update position to move forward
    protected updatePosition() {
        //Move forward, please.
        this.gpos.x += this.move.x;
    }

    //Resolve collisions based on the current stored bitmask
    public resolveCollisionBitmask()  {

        //Obstacle in front OR floor stops, reverse
        if (this.isColFace || !this.isColLand) {
            this.reverse();
        }
    }
}