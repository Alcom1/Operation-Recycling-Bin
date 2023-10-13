import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterGear from "./charactergear";

// Character states
enum GroundState {
    NORMAL,
    WAIT
}

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
    isGlide : true,
    animsMisc : [
        {
            speed : 5.0,
            images : [{ name : "char_rbg_wait", offsetX : 0 }],
            frameCount : 2,
            gposOffset : { x : -3, y : 0}
        }]
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

        console.log(this.gpos.x);

        switch(this.stateIndex) {

            case GroundState.NORMAL :
                if(this.isColFace && this.isColBack) {
                    debugger
                    this.setStateIndex(GroundState.WAIT);
                }
                else if (this.isColFace || !this.isColHang) {
                    this.reverse();
                }
                break;

            case GroundState.WAIT :
                if(!this.isColFace) {
                    this.setStateIndex(GroundState.NORMAL);
                }
                if(!this.isColBack) {
                    this.setStateIndex(GroundState.NORMAL);
                    this.reverse();
                }
                break;
        }
    }
}