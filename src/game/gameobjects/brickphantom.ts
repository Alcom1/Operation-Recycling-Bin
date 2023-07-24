import { col1D, GMULTX, GMULTY, Z_DEPTH } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Brick, { BrickParams } from "./brick";
import Stud from "./stud";

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