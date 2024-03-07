import { Point } from "engine/utilities/vect";
import { CharacterParams } from "./character";
import CharacterBin from "./characterbin";

/** Specifications of a Bin character */
const CharacterBinTallOverride = Object.freeze({
    height: 4,      // Extra tall bin
    speed : 0,      // Bins aren't animated
    animMain : {
        images : [{ name : "char_bin_tall", extension : "svg", offsetX : -69 }], // Bin image
        frameCount : 1,
        animsCount : 1
    }
});

/** A bin full of junk. Eat it. */
export default class CharacterBinTall extends CharacterBin {

    /** z-index get/setters */
    // public get zpos() : Point { 
    //     return this.gpos.getAdd({ 
    //         x : -1,
    //         y : -this.height + 1
    //     });
    // }
    // public get zSize() : Point {
    //     return {
    //         x : 2,
    //         y : this.height
    //     }; 
    // }

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterBinTallOverride));
    }
}
