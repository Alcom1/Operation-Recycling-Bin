import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickJumpOverride = Object.freeze({
    images : ["brick_jump", "brick_jump"],
    width : 2,
    isOn : true
});

export default class BrickJump extends BrickPlate {

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickJumpOverride));
    }
}
