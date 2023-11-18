import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, col1D, RING_BITSTACKB as ring, GMULTX, GMULTY, MASKS, OPPOSITE_DIRS } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Character from "./character";

// Character states
export enum GearState {
    NORMAL,
    STOP,
    WAIT
}

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

    public handleStepUpdate(proxs : Point[]) {

        this.storedCbm = 0;

        //Characters in proxminity
        proxs.forEach(p => {

            //Below
            if (p.y == 2) {
                this.storedCbm |= ring.flor
            }
            //Above
            if (p.y == -2) {
                this.storedCbm |= ring.roof
            }
            //Rightward
            if (p.x == 2) {
                this.storedCbm |= (this.move.x > 0 ? ring.face : ring.back)
            }
            //Leftward
            if (p.x == -2) {
                this.storedCbm |= (this.move.x > 0 ? ring.back : ring.face)
            }
        })

        // WALL BOUNDARY (WHY ARE WE YELLING)
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

        // Bricks
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

        if(this.stateIndex == GearState.NORMAL) {
            this.moveAll(this.move);
        }
    }

    /** Get both grid spaces ahead of this character */
    public getNoPlaceZone() : Point[] {

        return [-1, 0].flatMap(x => [-1, 0].map(y => new Vect(x,y)
            .getAdd(this.gpos)
            .getAdd(this.stateIndex == 0 ? this.move : {x : 0, y : 0})));
    }
}