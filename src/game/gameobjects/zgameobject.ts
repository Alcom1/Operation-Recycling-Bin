import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { getZIndex } from "engine/utilities/math";

/** Parameters for a Z-Index game object */
export interface ZGameObjectParams extends GameObjectParams {
    zIndex: number;
}

/** Game object with a static z-index */
export default class ZGameObject extends GameObject {

    private zIndex : number;    // The Z-Index in question.

    /** Constructor */
    constructor(params: ZGameObjectParams) {
        super(params);

        this.zIndex = params.zIndex || 0;
    }

    /** Get the Z-Index for sorting */
    public getGOZIndex() : number {
        return this.zIndex;
    }

    /** Set Z-Index with a modifier */
    public setZIndex(modifier : number) {
        this.zIndex = getZIndex(this.gpos, modifier);
    }
}