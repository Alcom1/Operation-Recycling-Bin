import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import BrickPhantom from "./brickphantom";
import Character, { CharacterParams } from "./character";

/** Specifications of a Bin character */
const characterBinOverride = Object.freeze({
    height: 2,      // Bins are this tall
    speed : 0,      // Bins aren't animated
    animMain : {
        images : [{ name : "char_bin", extension : "svg", offsetX : -69 }], // Bin image
        frameCount : 1,
        animsCount : 1
    }
});

/** A bin full of junk. Eat it. */
export default class CharacterBin extends Character {

    
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
        super(Object.assign(params, characterBinOverride));
    }
    
    /** Get bin colliders */
    public getColliders() : Collider[] {
        
        return [{ 
            mask : MASKS.block | MASKS.scrap | MASKS.water,
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        }];
    }

    /** */
    public getNoPlaceZone() : Point[] {
        return [-1, 0].map(o => this.gpos.getAdd({ x : o, y : -2 }));
    }

    /** Collect */
    public resolveCollision(mask : number) {
    
        if (mask & MASKS.scrap) {
            this.deactivate();
        }
    }
}
