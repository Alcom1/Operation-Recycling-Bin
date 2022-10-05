import { Collision } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, FOUR_BITSTACK as gcb, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import Character from "./character";

export default class CharacterRB extends Character {

    protected storedCbm: number = 0;      //Store Collision bitmask from collision for later resolution
    protected isStep: boolean = false;    //True on frames where a character step has occured

    //Get colliders
    public getColliders() : Collider[] {

        return [{ 
            mask : MASKS.block | MASKS.death | MASKS.enemy,
            min : this.gpos
                .getAdd({ x : -1 - 0.55, y : 1 - 0.55 - this.height})
                .getMult(GMULTX, GMULTY),
            max : this.gpos
                .getAdd({ x :  1 + 0.55, y : 1 + 0.55})
                .getMult(GMULTX, GMULTY),
            isSub : true
        },
        this.getPassiveCollider()];
    }

    //Check and resolve brick collisions
    protected handleStep() {

        this.isStep = true;
        this.storedCbm = 0;

        this.updatePosition();

        //WALL BOUNDARY
        if (this.gpos.x - 2 < BOUNDARY.minx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.back : gcb.face);
        }        
        else if (this.gpos.x + 2 > BOUNDARY.maxx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.face : gcb.back);
        }

        this.storedCbm |= this.brickHandler.checkCollisionRing(
            this.gpos.getAdd({
                x : -2, 
                y : -this.height}), 
            4, 
            this.move.x);
    }

    //Special collision resolving
    public resolveCollisions(collisions : Collision[]) {

        if(this.isStep)
        {
            this.isStep = false;                    //Reset step state
            super.resolveCollisions(collisions);    //Perform standard resolve to set bitmask for actual collisions
            this.resolveCollisionBitmask();         //Handle collisions based on the bitmask
        }
    }

    //
    protected resolveCollisionBitmask() {
        throw new Error("Not implemented!");
    }

    //
    protected updatePosition()  {
        throw new Error("Not implemented!");
    }

    protected getPassiveCollider() : Collider {

        return { 
            mask : 0,   //Passive
            min : this.gpos.getAdd({ x : - (this.move.x < 0 ? 2 : 0), y : 1 - this.height}),
            max : this.gpos.getAdd({ x : + (this.move.x < 0 ? 0 : 2), y : 1})
        }
    }
}