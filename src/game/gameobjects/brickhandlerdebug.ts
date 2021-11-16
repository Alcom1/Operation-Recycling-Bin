import { GameObjectParams } from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";

interface PointDebug extends Point {
    opacity : number;
}

export default class BrickHandlerDebug extends BrickHandler {

    private debugPoints : PointDebug[] = [];

    constructor(params: GameObjectParams) {
        super(params);

        this.tags.push("BrickHandler"); //Treat this as a regular brick handler
    }

    //Update, fade older debug points
    public update(dt: number) {
        this.debugPoints.forEach(dp => dp.opacity -= dt * 2);               //Fade debug points
        this.debugPoints = this.debugPoints.filter(dp => dp.opacity > 0);   //Remove debug points after they disappear
    }

    //Draw debug points
    public draw(ctx: CanvasRenderingContext2D) {

        ctx.fillStyle = "#0FF"

        this.debugPoints.forEach(dp => {
            ctx.globalAlpha = dp.opacity;
            ctx.fillRect(
                GMULTX * dp.x + 4,
                GMULTY * dp.y + 4,
                GMULTX - 8,
                GMULTY - 8
            );
        });
    }

    /** Check collisons for a vertically-looping range and return a bitmask */
    public checkCollisionRange(pos: Point, dir: number, start: number, final: number, height: number, width: number = 2): number {

        //Create new debug points from this collision
        for(let i = start; i < final; i++) {
            this.debugPoints.push({
                x : pos.x + Math.floor(i / height) % width  * dir,  //Wrap by width to go back and check ceiling
                y : pos.y + i % height + 1,                         //Wrap by height
                opacity : 1
            });
        }

        //Perform actual collision check
        return super.checkCollisionRange(pos, dir, start, final, height, width);
    }
}
