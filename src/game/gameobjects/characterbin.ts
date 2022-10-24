import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import Character, { CharacterParams } from "./character";

/** Specifications of a Bin character */
const characterBinOverride = Object.freeze({
    height: 3,                                      // Bins are this tall
    speed : 0,                                      // Bins aren't animated
    images : [{ name : "char_bin", offsetX : 0}],   // Bin image
    frameCount : 1,
    animsCount : 1
});

/** A bin full of junk. Eat it. */
export default class CharacterBin extends Character {

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, characterBinOverride));
    }
    
    /** Get bin colliders */
    public getColliders() : Collider[] {
        
        return [{ 
            mask : MASKS.block | MASKS.scrap | MASKS.water,
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        },{ 
            mask : 0,           // Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        }];
    }

    /** Collect */
    public resolveCollision(mask : number) {
    
        if (mask & MASKS.scrap) {
            this.deactivate();
        }
    }
}
