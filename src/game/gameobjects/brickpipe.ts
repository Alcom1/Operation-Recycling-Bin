import { getZIndex } from "engine/utilities/math";
import BrickPlate, { BrickPlateParams } from "./brickplate";
import Sprite, { SpriteParams } from "./sprite";

const brickPipeOverride = Object.freeze({
    images : ["brick_pipe", "brick_pipe"],
    width : 2,
    isOn : true
});

export default class BrickPipe extends BrickPlate {

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickPipeOverride));
    }
}
