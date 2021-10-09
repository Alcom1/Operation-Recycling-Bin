import Engine from "engine/engine";
import { GameObjectParams } from "engine/gameobjects/gameobject";
import Brick from "./brick";

export default class BrickPlate extends Brick {

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, {...params, ...{ width : 4 }});

        this.image = this.engine.library.getImage("brick_plate");
    }
}