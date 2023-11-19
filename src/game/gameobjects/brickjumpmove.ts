import BrickJump from "./brickjump";
import { BrickTileParams } from "./bricktile";

/** Specifications of a moving jump brick (Non-grey color means it can be moved) */
const brickJumpMoveOverride = Object.freeze({
    color : "yellow",
    images : ["brick_jump_move_up", "brick_jump_move"],
    imageTop : "brick_jump_move_top"
});

/** Jump brick except it can be moved (because it's yellow) */
export default class BrickJumpMove extends BrickJump {

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, brickJumpMoveOverride));
    }
}