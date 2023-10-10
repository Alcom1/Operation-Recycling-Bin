import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, col1D, RING_BITSTACKB as ring, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import Character from "./character";

/** Base gear character */
export default class CharacterGear extends Character {

    protected storedCbm: number = 0;      // Store Collision bitmask from collision for later resolution
    protected isStep: boolean = false;    // True on frames where a character step has occured
    
    protected get isColFlor() : boolean { return !!(this.storedCbm & ring.flor); }  // Collision below
    protected get isColRoof() : boolean { return !!(this.storedCbm & ring.roof); }  // Collision above
    protected get isColFace() : boolean { return !!(this.storedCbm & ring.face); }  // Collision front
    protected get isColBack() : boolean { return !!(this.storedCbm & ring.back); }  // Collision back
    protected get isColLand() : boolean { return !!(this.storedCbm & ring.land); }  // Collision front-low corner
    protected get isColBand() : boolean { return !!(this.storedCbm & ring.band); }  // Collision front-rear corner
    protected get isColHang() : boolean { return !!(this.storedCbm & ring.hang); }  // Collision distant front-low

    /** Get colliders */
    public getColliders() : Collider[] {

        return [{ 
            mask : MASKS.death,
            min : this.gpos
                .getAdd({ x : -1, y : 1 - this.height})
                .getMult(GMULTX, GMULTY),
            max : this.gpos
                .getAdd({ x :  1, y : 1})
                .getMult(GMULTX, GMULTY),
            isSub : true
        }];
    }

    public handleStepUpdate() {

        this.storedCbm = 0;

        // WALL BOUNDARY
        if (this.gpos.x - 2 < BOUNDARY.minx) {
            this.storedCbm |= (this.move.x > 0 ? ring.back : ring.face);
        }        
        else if (this.gpos.x + 2 > BOUNDARY.maxx) {
            this.storedCbm |= (this.move.x > 0 ? ring.face : ring.back);
        }

        // Ceiling boundary
        if (this.gpos.y - 2 < BOUNDARY.miny) {
            this.storedCbm |= ring.roof;
        }

        this.storedCbm |= this.brickHandler.checkCollisionRing(
            this.gpos.getAdd({
                x : -2, 
                y : -this.height}), 
            4, 
            this.move.x,
            true);
    }

    /** */
    public handleStep() {
        this.moveAll(this.move);
    }
}