import { GameObjectParams } from "engine/gameobjects/gameobject";
import { col1D, Faction, GMULTX, GMULTY, MatchFactions } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import Brick from "./brick";
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

        this.tags.push("BrickHandler"); // Treat this as a regular brick handler
    }

    /** Update, fade older debug points */
    public update(dt: number) {
        this.debugPoints.forEach(dp => dp.opacity -= dt * 2);               // Fade debug points
        this.debugPoints = this.debugPoints.filter(dp => dp.opacity > 0);   // Remove debug points after they disappear
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

    /** Check collisons for a box-area */
    public checkCollisionBox(
        min: Point, 
        max: Point,
        faction: Faction = Faction.NEUTRAL): number {

        let collisions = 0; // Collision bitbask

        for(let y = min.y; y <= max.y; y++) {

            let bricks = this.bricksActive.filter(
                b => b.gpos.y == y &&
                MatchFactions(b.faction, faction));

            for(let x = min.x; x <= max.x; x++) {

                this.debugPoints.push({ x : x, y : y, opacity : 1});

                bricks.forEach(brick => {
                    if (col1D(
                        brick.gpos.x - 1, 
                        brick.gpos.x + brick.width, 
                        x,
                        x
                    )) {
                        collisions += 1 << ((y - min.y) * (max.x - min.x + 1) + x - min.x);
                    }
                })
            }
        }

        return collisions;
    }
}
