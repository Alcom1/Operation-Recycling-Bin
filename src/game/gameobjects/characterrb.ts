import { Collider } from "engine/modules/collision";
import { GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import Character from "./character";

export default class CharacterRB extends Character {

    //Get colliders
    public getColliders() : Collider[] {

        return [{ 
            mask : MASKS.block | MASKS.death | MASKS.enemy,
            min : this.gpos
                .getAdd({ x : -1 - 0.4, y : 1 - 0.55 - this.height})
                .getMult(GMULTX, GMULTY),
            max : this.gpos
                .getAdd({ x :  1 + 0.4, y : 1 + 0.55})
                .getMult(GMULTX, GMULTY),
            isSub : true
        },
        this.getPassiveCollider()];
    }

    protected getPassiveCollider() : Collider {

        return { 
            mask : 0,   //Passive
            min : this.gpos.getAdd({ x : - (this.move.x < 0 ? 2 : 0), y : 1 - this.height}),
            max : this.gpos.getAdd({ x : + (this.move.x < 0 ? 0 : 2), y : 1})
        }
    }
}