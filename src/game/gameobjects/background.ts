import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import {colorTranslate, colorMult, GMULTY, Z_DEPTH, BOUNDARY} from "engine/utilities/math";

export default class Background extends GameObject {
    /** The color of the background bricks */
    private color: string = colorTranslate('grey');
    /** The shaded color of the background bricks */
    private colorDark!: string;
    /** Baked image data for this background */
    private image: HTMLImageElement = new Image();

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, params);
        this.colorDark = colorMult(this.color, 0.625);

        // Bake image of brick
        this.image.src = this.engine.baker.bake((ctx) => this.drawBackground(ctx), undefined, undefined, "BACKGROUND." + this.parent.name);
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }

    public drawBackground(ctx: CanvasRenderingContext2D): void {
        // Right face style
        ctx.fillStyle = this.colorDark;

        // Iteratively draw right sides for the left side wall.
        for (let i = 0; i < BOUNDARY.maxy + 1; i++) {
            //Right face
            ctx.beginPath();                         // Start path
            ctx.moveTo(0, GMULTY);                   // Lower left corner
            ctx.lineTo(0, 0);                        // Upper left corner
            ctx.lineTo(Z_DEPTH, -Z_DEPTH);           // Upper right corner
            ctx.lineTo(Z_DEPTH, GMULTY - Z_DEPTH);   // Lower right corner
            ctx.fill();                              // Fill right face

            ctx.translate(0, GMULTY);               // Translate downward for each iteration
        }
    }
}
