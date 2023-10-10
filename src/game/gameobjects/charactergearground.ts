import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

/** Specifications of a grounded gearbot */
const CharacterGearGroundOverride = Object.freeze({
    height: 2,
    speed : 5.0,
    animMain : {
        images : [        
            { name : "char_rbg_left", offsetX : 0 },
            { name : "char_rbg_right", offsetX : 0}],
        frameCount : 2,
        animsCount : 1
    },
    isGlide : true
});

/**A normal grounded gearbot */
export default class CharacterGearGround extends CharacterGear {

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearGroundOverride));
    }

    /** */
    public handleStepUpdate() {
        super.handleStepUpdate();

        if (this.isColFace || !this.isColHang) {
            this.reverse();
        }
    }
}