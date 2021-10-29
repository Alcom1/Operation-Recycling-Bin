import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

export interface ZGameObjectParams extends GameObjectParams {
    zIndex: number;
}

/** Game object with a static z-index */
export default class ZGameObject extends GameObject {

    private zIndex : number;

    constructor(engine: Engine, params: ZGameObjectParams) {
        super(engine, params);

        this.zIndex = params.zIndex || 0;
    }

    public getGOZIndex() : number {
        return this.zIndex;
    }
}