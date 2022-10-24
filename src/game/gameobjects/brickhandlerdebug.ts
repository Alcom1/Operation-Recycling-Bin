import { GameObjectParams } from "engine/gameobjects/gameobject";
import { col1D, GMULTX, GMULTY } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";

/** A point with an opacity for fade effects */
interface PointDebug extends Point {
    opacity : number;
}

/** Brickhander extension with debug methods */
export default class BrickHandlerDebug extends BrickHandler {
    private debugPoints : PointDebug[] = [];

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        this.tags.push("BrickHandler"); //Treat this as a regular brick handler
    }

    /** Update, fade older debug points */
    public update(dt: number) {
        this.debugPoints.forEach(dp => dp.opacity -= dt * 2);               //Fade debug points
        this.debugPoints = this.debugPoints.filter(dp => dp.opacity > 0);   //Remove debug points after they disappear
    }

    /** Draw debug points */
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

    /** Check collisons for a square ring and return a bitmask */
    public checkCollisionRing(pos: Point, size: number, dir : number = 1): number {

        let collisions = 0; //Collision bitbask
        let count = 0;      //Count gridspaces being checked

        //Vertical travel
        for(let j = pos.y; j < pos.y + size; j++) {

            //Get this row
            let row = this.rows.find(r => r.row == j)?.bricks.filter(b => !b.isSelected) || [];

            //Horizontal travel, skip to end unless this is the first or last row to create a ring shape
            for(let i = pos.x; i < pos.x + size; i += ((j > pos.y && j < pos.y + size - 1) ? size - 1 : 1)) {

                //Reverse horizontally if the direction isn't positive.
                let check = dir > 0 ? i : 2 * pos.x - i + size - 1;

                this.debugPoints.push({ x : check, y : j, opacity : 1});

                //Check each brick int his row.
                row.forEach(brick => {

                    if (col1D(
                        brick.gpos.x - 1, 
                        brick.gpos.x + brick.width,
                        check,
                        check
                    )) {
                        collisions += 1 << (count);
                    }
                });

                count++;
            }
        }

        return collisions;
    }
}
