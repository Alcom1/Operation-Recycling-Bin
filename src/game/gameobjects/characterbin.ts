import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import Character, { CharacterParams } from "./character";

/** A bin full of junk. Eat it. */
export default class CharacterBin extends Character {

    /** Constructor */
    constructor(params: CharacterParams) {
        super(params);

        this.tags.push("CharacterBin");
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
