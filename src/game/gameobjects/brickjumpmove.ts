import BrickJump from "./brickjump";
import { BrickPlateParams } from "./brickplate";

const brickJumpMoveOverride = Object.freeze({
    color : "yellow",
    images : ["brick_jump_move_up", "brick_jump_move"],
    imageTop : "brick_jump_move_top"
});

export default class BrickJumpMove extends BrickJump {

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickJumpMoveOverride));
    }
}