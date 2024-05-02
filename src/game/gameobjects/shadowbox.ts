import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Vect, { Point } from "engine/utilities/vect";

export interface ShadowboxParams extends GameObjectParams {
    size : Point;
}

/** Handles signs and pausing for signs */
export default class Shadowbox extends GameObject {

    private size: Point;

    /** Constructor */
    constructor(params: ShadowboxParams) {
        super(params);

        this.size = params.size;
    }

    /** Draw sign */
    public draw(ctx : CanvasRenderingContext2D) {

        //Sign drop shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 25;
        ctx.fillRect(0, 0, this.size.x, this.size.y); // 670, 400
    }
}