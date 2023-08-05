import { Collider } from "engine/modules/collision";
import { Faction, MASKS } from "engine/utilities/math";
import BrickHandler from "./brickhandler";
import { BrickTileParams } from "./bricktile";
import BrickTileTop from "./bricktiletop";

/** Specifications of a jump brick */
const brickJumpOverride = Object.freeze({
    images : ["brick_jump_up", "brick_jump"],
    imageTop : "brick_jump_top",
    isShowTopIfOn : false
});

/** Jump brick, has an extra plate on top for the jump animation */
export default class BrickJump extends BrickTileTop {

    private brickHandler!: BrickHandler;
    private timer : number = 0;             // Timer 1 for jump animation
    private timerDuration : number = 0.1;   // Timer 1 duration
    private timer2 : number = 0;            // Timer 2 for jump cooldown
    private timer2Duration : number = 1.2;  // Timer 2 duration

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign({}, brickJumpOverride, params));
    }

    /** Initialize Jump Brick */
    public init() {

        // Get brick handler to to check if this jump is blocked by other bricks
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;
    }

    /** Update jump brick for timer */
    public update(dt : number) {

        // Update Timer
        if (this.timer > 0) {
            this.timer -= dt;
        }
        else {
            this.timer = 0;
            this.setOnOff(true);
        }

        // Update Timer 2
        if (this.timer2 > 0) {
            this.timer2 -= dt;
        }
        else {
            this.timer2 = 0;
        }
    }

    /** Check if this brick is blocked by bricks on top */
    public isBlocked() : boolean {

        // Grey bricks probably shouldn't perform this check.
        if (this.isGrey) {
            return false;
        }

        // Check for bricks
        return !!this.brickHandler.checkCollisionRange(
            this.gpos.getAdd({
                x : 0,
                y : -2
            }), // Position
            1,  // Direction
            0,  // START
            2,  // FINAL
            1,  // HEIGHT
            undefined, 
            Faction.HOSTILE);
    }

    /** Get hazard and passive colliders of this brick. */
    public getColliders() : Collider[] {

        // Combine with passive collider from base class, only return jump hitbox if the plate is on and not selected
        return super.getColliders().concat(this.isOn && this.timer2 == 0 && !this.isSelected && !this.isBlocked() ? [{
            mask : MASKS.jumps,
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }] : []);
    }

    /** Turn off */
    public resolveCollision(mask : number) {

        // Turn off when a jump is triggered
        if (mask & MASKS.jumps) {
            this.setOnOff(false);
            this.timer = this.timerDuration;
            this.timer2 = this.timer2Duration;
        }
    }
}
