import { Point } from "engine/utilities/vect";
import { CharacterParams } from "./character";
import CharacterGear, { GearState } from "./charactergear";

/** Specifications of a grounded gearbot */
const CharacterGearEyeOverride = Object.freeze({
    height: 2,
    speed : 5.0,
    animMain : {
        images : [{ name : "char_rbe", extension : "svg", offsetX : 0 }],
        frameCount : 2,
        animsCount : 1
    },
    isGlide : true,
    animsMisc : [{
        speed : 6.0,
        images : [{ name : "char_rbe", extension : "svg", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -3, y : 0}
    },{
        speed : 6.0,
        images : [{ name : "char_rbe", extension : "svg", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -3, y : 0}
    }]
});

/**A normal grounded gearbot */
export default class CharacterGearEye extends CharacterGear {

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearEyeOverride));
    }

    /** */
    public handleStepUpdate(proxs : Point[]) {
        super.handleStepUpdate(proxs);

        switch(this._stateIndex) {

            case GearState.NORMAL :
                if (this.isColFace) {

                    if (this.isColBack) {

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
                if (!this.isColFace) {
                    this.setStateIndex(GearState.NORMAL);
                }
                else if (!this.isColBack) {
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