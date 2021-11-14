import { Collider } from "engine/modules/collision";
import BrickJump from "./brickjump";
import { BrickPlateParams } from "./brickplate";

const brickJumpMoveOverride = Object.freeze({
    color : "yellow",
    images : ["brick_jump_move", "brick_jump_move"],
    width : 2,
    isOn : true
});

export default class BrickJumpMove extends BrickJump {

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickJumpMoveOverride));
    }
}