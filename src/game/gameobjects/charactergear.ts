import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, col1D, FOUR_BITSTACK as gcb, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import Character from "./character";

export default class CharacterGear extends Character {

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
    protected handleStep(isStart : boolean = false) {

        this.isStep = true;
        this.storedCbm = 0;

        if(!isStart) {
            this.updatePosition();
        }

        //WALL BOUNDARY
        if (this.gpos.x - 2 < BOUNDARY.minx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.back : gcb.face);
        }        
        else if (this.gpos.x + 2 > BOUNDARY.maxx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.face : gcb.back);
        }

        //Ceiling boundary
        if(this.gpos.y - 2 < BOUNDARY.miny) {

            this.storedCbm |= gcb.ceil;
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

    //Store front collisions in bitmask
    public resolveCollision(mask : number, other : GameObject) {

        //Block face if there's something in front
        if (mask & (MASKS.enemy | MASKS.block)){

            //Get position difference relative to this's forward facing direction
            var diff = other.gpos.getSub(this.gpos).getMult(this.move.x, 1);

            //1D vertical collision
            var vertBlock = col1D(
                this.gpos.y - this.height,
                this.gpos.y,
                other.gpos.y - (other as Character).height ?? 1,
                other.gpos.y);

            //1D horizontal collision
            var horzBlock = col1D(
                this.gpos.x,
                this.gpos.x + 2,
                other.gpos.x,
                other.gpos.x + 2)

            //If a vertically-blocking character...
            if (vertBlock) {

                //Is ahead
                if( diff.x > 0) {

                    //If there is a gap between these characters
                    if (Math.abs(this.gpos.x - other.gpos.x) > 2) {
    
                        //Check if they're moving toward each other
                        if ((other as Character).isNormalMovment &&
                            (other as Character).movex != this.move.x) {
    
                            this.storedCbm |= gcb.face; //Block face
                        }
                    }
                    //If 
                    else {
    
                        this.storedCbm |= gcb.face; //Block face
                    }
                }
                //Is behind
                else {

                    this.storedCbm |= gcb.back;
                }
            }
            //If a horizontally-blocking character...
            if (horzBlock && Math.abs(diff.y) < 3) {

                //Is above
                if(diff.y < 0) {

                    this.storedCbm |= gcb.ceil;
                }
                
                //Is below
                else if(diff.y > 0) {

                    this.storedCbm |= gcb.flor;
                }
            }
            //If diagonal, and one character is moving above/below the other
            if (Math.abs(diff.x) == 2 && Math.abs(diff.y) == 2 &&                                   //Diagonal check
                Math.sign((other as Character).movex) == Math.sign(this.gpos.x - other.gpos.x)) {   //Move check

                //Is above
                if(diff.y < 0) {

                    this.storedCbm |= gcb.ceil;
                }
                
                //Is below
                else if(diff.y > 0) {

                    this.storedCbm |= gcb.flor;
                }
            }
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

    //Get passive collider (blocks bricks)
    protected getPassiveCollider() : Collider {

        return { 
            mask : 0,   //Passive
            min : this.gpos.getAdd({ x : - (this.move.x < 0 ? 2 : 0), y : 1 - this.height}),
            max : this.gpos.getAdd({ x : + (this.move.x < 0 ? 0 : 2), y : 1})
        }
    }
}