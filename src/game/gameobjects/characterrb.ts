import { Collider } from "engine/modules/collision";
import { GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import Character from "./character";

export default class CharacterRB extends Character {

    //Get colliders
    public getColliders() : Collider[] {

        return [{ 
            mask : MASKS.block | MASKS.death | MASKS.enemy,
            min : this.gpos
                .getAdd({ x : -1, y : 1 - this.height})
                .getMult(GMULTX, GMULTY)
                .getAdd(this.spos),
            max : this.gpos
                .getAdd({ x :  1, y : 1})
                .getMult(GMULTX, GMULTY)
                .getAdd(this.spos),
            isSub : true
        },{ 
            mask : 0,   //Passive
            min : this.gpos.getAdd({ x : -1 - (this.move.x < 0 ? 1 : 0), y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1 + (this.move.x < 0 ? 0 : 1), y : 1})
        }];
    }
}