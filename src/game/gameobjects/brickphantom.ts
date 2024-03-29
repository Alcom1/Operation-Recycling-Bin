import { GMULTX, GMULTY, Z_DEPTH } from "engine/utilities/math";
import Brick, { BrickParams } from "./brick";

/** Ordinary brick with studs */
export default class BrickPhantom extends Brick {

    /** Constructor */
    constructor(params: BrickParams) {
        super({...params, blockStrength : 1});

        this.tags.push("BrickPhantom");
    }

    draw(ctx : CanvasRenderingContext2D) {

        if(this.isDebug) {
            ctx.fillStyle = "#0008";
            ctx.fillRect(4 + Z_DEPTH, 4 - Z_DEPTH, GMULTX * this.width - 8, GMULTY - 8);
        }
    }
}