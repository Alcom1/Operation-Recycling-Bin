import { GMULTX, GMULTY } from "engine/utilities/math";
import Brick, { BrickParams } from "./brick";

/** Ordinary brick with studs */
export default class BrickPhantom extends Brick {

    /** Constructor */
    constructor(params: BrickParams) {
        super({...params, block : true});
    }

    draw(ctx : CanvasRenderingContext2D) {

        if(this.isDebug) {
            ctx.fillStyle = "#0008";
            ctx.fillRect(4, 4, GMULTX * this.width - 8, GMULTY - 8);
        }
    }
}