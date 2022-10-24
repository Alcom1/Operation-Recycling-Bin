import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { getZIndex } from "engine/utilities/math";

export interface ZGameObjectParams extends GameObjectParams {
    zIndex: number;
}

/** Game object with a static z-index */
export default class ZGameObject extends GameObject {

    private zIndex : number;

    /** Constructor */
    constructor(params: ZGameObjectParams) {
        super(params);

        this.zIndex = params.zIndex || 0;
    }

    public getGOZIndex() : number {
        return this.zIndex;
    }

    public setZIndex(modifier : number) {
        this.zIndex = getZIndex(this.gpos, modifier);
    }
}