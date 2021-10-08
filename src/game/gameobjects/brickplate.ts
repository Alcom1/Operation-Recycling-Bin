import Engine from "engine/engine";
import { GameObjectParams } from "engine/gameobjects/gameobject";
import BrickBase from "./brickbase";

export default class BrickPlate extends BrickBase {

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, {...params, ...{ width : 4 }});

        this.image = this.engine.library.getImage("brick_plate");
    }
}