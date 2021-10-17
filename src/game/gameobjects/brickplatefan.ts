import Engine from "engine/engine";
import Animat, { AnimationParams } from "./animation";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickPlateFanOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_fan"]
});

export default class BrickPlateFan extends BrickPlate {

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, brickPlateFanOverride));
    }
}