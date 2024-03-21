import { Point } from "engine/utilities/vect";
import { CharacterParams } from "./character";
import CharacterBin from "./characterbin";

/** Specifications of a Bin character */
const CharacterBinNormalOverride = Object.freeze({
    height: 2,      // Bins are this tall
    speed : 0,      // Bins aren't animated
    animMain : {
        images : [{ name : "char_bin", extension : "svg", offsetX : -69 }], // Bin image
        frameCount : 1,
        animsCount : 1
    }
});

/** A bin full of junk. Eat it. */
export default class CharacterBinNormal extends CharacterBin {
    
    /** z-index get/setters */
    public get zpos() : Point { 
        return this.gpos.getAdd({ 
            x : -1,
            y : - this.height
        });
    }
    public get zSize() : Point {
        return {
            x : 2,
            y : this.height + 1
        }; 
    }

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterBinNormalOverride));
    }
}
