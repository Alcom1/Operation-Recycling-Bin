import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, col1D, RING_BITSTACK as ring, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
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

    /** Get colliders */
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

    /** Check and resolve brick collisions */
    protected handleStep(isStart : boolean = false) {

        this.isStep = true;
        this.storedCbm = 0;

        // Update position if this is not a starting step
        if (!isStart) {
            this.updatePosition();
        }

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
            this.move.x);
    }

    /** Special collision resolving */
    public resolveCollisions(collisions : Collision[]) {

        if (this.isStep)
        {
            this.isStep = false;                    // Reset step state
            super.resolveCollisions(collisions);    // Perform standard resolve to set bitmask for actual collisions
            this.resolveCollisionBitmask();         // Handle collisions based on the bitmask
        }
    }

    /** Store front collisions in bitmask */
    public resolveCollision(mask : number, other : GameObject) {

        // Block face if there's something in front
        if (mask & (MASKS.enemy | MASKS.block)){

            // Get position difference
            let diff = other.gpos.getSub(this.gpos);
            // Get position difference relative to this's forward facing direction
            let diffRel = diff.getMult(this.move.x, 1);

            // other object as character to get its movement directions
            let otherChar = other as Character

            // If the other character is moving towards this one, horizontally
            let isHorzOppose =                          // This probably doesn't properly handle the HALT state.
                otherChar.move.y == 0 &&                // Other is moving horizontally
                Math.sign(diff.x) == -otherChar.move.x; // Other is moving towards self

            // If the other character is moving towards this one, vertically
            let isVertOppose = Math.sign(diff.y) == -otherChar.move.y;

            // If character is blocking horizontally
            let horzBlock = col1D(      // 1D vertical collision
                this.gpos.y - this.height,
                this.gpos.y,
                other.gpos.y - (other as Character).height ?? 1,
                other.gpos.y) && (      // Check if close enough to collide, if other character is adjacent or 1x away and approaching
                    Math.abs(diff.x) <= 2 || isHorzOppose && Math.abs(diff.x) == 3);

            // If character is blocking horizontally
            let vertBlock = col1D(      // 1D horizontal collision
                this.gpos.x,
                this.gpos.x + 2,
                other.gpos.x,
                other.gpos.x + 2) && (  // Check if close enough to collide, if other character is adjacent or 1x away and approaching
                    Math.abs(diff.y) <= 2 || isVertOppose && Math.abs(diff.y) == 3);
            
            // If a horizontally-blocking character...
            if (horzBlock) {

                // Is ahead
                if ( diffRel.x > 0) {

                    this.storedCbm |= ring.face;
                }
                // Is behind
                else {

                    this.storedCbm |= ring.back;
                }
            }
            // If a vertically-blocking character...
            if (vertBlock) {

                // Is above
                if (diffRel.y < 0) {

                    this.storedCbm |= ring.roof;
                }
                // Is below
                else {

                    this.storedCbm |= ring.flor;
                }
            }
            // If diagonal, and one character is moving above/below the other
            if (Math.abs(diff.x) == 2 && 
                Math.abs(diff.y) && 
                Math.sign(otherChar.move.y) == -Math.sign(diff.y)) {
                 
                // Is above
                if (diffRel.y < 0) {

                    this.storedCbm |= ring.roof;
                }
                
                // Is below
                else if (diff.y > 0) {

                    this.storedCbm |= ring.flor;
                }
            }
        }
    }

    /** Resolve collisions in the stored bitmask. Not implemented for base class. */
    protected resolveCollisionBitmask() {
        throw new Error("Not implemented!");
    }

    /** Update position. Not implemented for base class. */
    protected updatePosition()  {
        throw new Error("Not implemented!");
    }

    /** Get passive collider (blocks bricks) */
    protected getPassiveCollider() : Collider {

        return { 
            mask : 0,   // Passive
            min : this.gpos.getAdd({ x : - (this.move.x < 0 ? 2 : 0), y : 1 - this.height}),
            max : this.gpos.getAdd({ x : + (this.move.x < 0 ? 0 : 2), y : 1})
        }
    }
}