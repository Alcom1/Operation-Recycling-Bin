import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { RING_BITSTACK as gcb, MASKS } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import { CharacterParams } from "./character";
import CharacterGear, { GearState } from "./charactergear";

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
    animsMisc : [{
            speed : 5.0,
            images : [{ name : "char_rbg_stop", offsetX : 0 }],
            frameCount : 2,
            gposOffset : { x : -3, y : 0}
        },{
            speed : 3.0,
            images : [
                { name : "char_rbg_left", offsetX : 0 },
                { name : "char_rbg_right", offsetX : 0}],
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
    public handleStepUpdate(proxs : Point[]) {
        super.handleStepUpdate(proxs);

        switch(this.stateIndex) {

            case GearState.NORMAL :
                if (this.isColFace || !this.isColLand) {

                    if (this.isColBack || !this.isColBand) {

                        this.setStateIndex(GearState.STOP);
                    }
                    else {

                        this.reverse();
                        this.setStateIndex(GearState.WAIT);
                    }
                }
                break;

            case GearState.STOP :
            case GearState.WAIT :
                if (!this.isColFace && this.isColLand) {
                    this.setStateIndex(GearState.NORMAL);
                }
                else if (!this.isColBack && this.isColBand) {
                    this.reverse();
                    this.setStateIndex(GearState.NORMAL);
                }
                else {
                    this.setStateIndex(GearState.STOP);
                }
                break;
        }
    }
}