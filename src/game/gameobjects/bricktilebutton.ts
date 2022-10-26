import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import BrickTile, { BrickTileParams } from "./bricktile";

/** Specifications of a button tile */
const brickButtonOverride = Object.freeze({
    images : ["brick_button_off", "brick_button_on"],
    width : 2
});

/** A tile with a button effect */
export default class BrickTileButton extends BrickTile {

    plates: BrickTile[] = [];
    private isLock : boolean = false;   // If this button is locked and can't be flipped again */
    private isLeft : boolean = false;   // If the presser of this button left and it *can* be flipped again

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, brickButtonOverride));
    }

    /** Initialize this button, get all tiles with matching circuits */
    public init() {

        // Get plates affected by this button (also includes self?)
        this.plates = (this.engine.tag.get(
            "BrickTile", 
            "Level") as BrickTile[]).filter(p => p.circuit == this.circuit);
    }

    /** Update timer */
    public update(dt: number) {

        // Unlock the button after the presser leaves
        if (this.isLeft) {
            this.isLock = false;
        }

        // Setup a check for if the presser left while this button is locked
        if (this.isLock) {
            this.isLeft = true;
        }
    }

    /** Get hazard and passive colliders of this brick. */
    public getColliders() : Collider[] {

        // Combine with passive collider from base class
        return super.getColliders().concat([{
            mask : MASKS.press,  // Button
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }]);
    }
    
    /** Flip */
    public resolveCollision(mask : number) {

        // Turn off
        if (mask & MASKS.press) {

            // Left check failed, presser is still here
            this.isLeft = false;

            if (!this.isLock) {
                var temp = !this.isOn;                      // Store opposite of this button
                this.plates.forEach(p => p.setOnOff(temp)); // Set all other plates in this circuit
                this.isLock = true;                         // Lock the button to prevent repeat presses
            }
        }
    }
}