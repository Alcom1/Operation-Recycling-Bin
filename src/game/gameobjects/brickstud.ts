import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { colorAdd, colorMult, colorTranslate, GMULTX, GMULTY, STUD_HEIGHT, STUD_RADIUS, UNDER_CURSOR_Z_INDEX, Z_DEPTH } from "engine/utilities/math";

interface BrickStudParams extends GameObjectParams {
    color?: string;
}

/** Series of studs for a brick */
export default class BrickStud extends GameObject {
    color: string;
    colorDark: string;
    colorBright: string;
    isGrey: boolean;

    image = new Image();

    isPressed = false;
    isSelected = false;
    isSnapped = false;
    isVisible = true;

    constructor(engine: Engine, params: BrickStudParams) {
        super(engine, params);

        this.color = colorTranslate(params.color);
        this.colorDark = colorMult(this.color, 0.625);
        this.colorBright = colorAdd(this.color, 48);
        this.isGrey = !params.color;

        this.zIndex =          // Z-sort vertically and then horizontally.
            this.gpos.x * 2 -  // 2x multiplier for stud overlap
            this.gpos.y * 100  // Y-pos has priority over X-pos.
            + 1;               // Plus one for stud overlap

        // Bake image of stud
        this.image.src = this.engine.baker.bake(
            ctx => this.drawBrickStud(ctx),
            // Width/height to contain both stud images
            GMULTX * 2,
            Z_DEPTH * 2,
            "STUD." + this.color
        );
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        if(this.isVisible) {
            // Global transparency for selection states
            ctx.globalAlpha =
                this.isSnapped ? 0.75:  // Snapped studs are transparent
                this.isSelected ? 0.5:  // Selected studs are more transparent
                this.isPressed ? 0.75:  // Pressed studs are less transparent again
                1.0;                    // Otherwise opaque if not selected or pressed
            
            // Draw the stored image for this stud
            ctx.drawImage(this.image, Z_DEPTH - 13.5, 0);
        }
    }

    /** Set this stud's snap state */
    public snap(state: boolean): void {
        if (state) {
            this.isSnapped = true;
            this.zIndex =
               (this.gpos.x + Math.round(this.spos.x / GMULTX)) * 2 -   // 2x multiplier for stud overlap
               (this.gpos.y + Math.round(this.spos.y / GMULTY)) * 100 + // Y-pos has priority over X-pos.
               1;                                                       // Plus one for stud overlap
        }
        else {
            this.isSnapped = false;
            // Set Z-index for dragging
            this.zIndex = UNDER_CURSOR_Z_INDEX;
        }
    }

    /** Setup this stud for pressing */
    public press(): void {
        this.isPressed = true;
    }

    // Setup this stud for selecting
    public select(): void {
        this.isSelected = true;
        this.zIndex = UNDER_CURSOR_Z_INDEX;
    }

    /** Reset this stud's z-index */
    public deselect(): void {
        this.zIndex =               // Z-sort vertically and then horizontally.
            this.gpos.x * 2 -       // 2x multiplier for stud overlap
            this.gpos.y * 100 +     // Y-pos has priority over X-pos.
            1;                      // Plus one for stud overlap
        
        this.isPressed = false;
        this.isSelected = false;
        this.isSnapped = false;
    }

    /** Draw sequence for this stud. */
    private drawBrickStud(ctx: CanvasRenderingContext2D): void {
        // Offset for baked drawing.
        ctx.translate(12.5, GMULTY);

        // Stud
        for (let i = 1; i >= 0; i--) {
            // Individual stud offset
            const off = i * STUD_HEIGHT * 2;

            // Stud column style
            const gradient = ctx.createLinearGradient(off - STUD_RADIUS, 0, off + STUD_RADIUS, 0); // Gradient for stud column
            gradient.addColorStop(0, this.color);                                                  // Gradient light shading
            gradient.addColorStop(1, this.colorDark);                                              // Gradient dark shading
            ctx.fillStyle = gradient;

            // Stud column
            ctx.beginPath();
            ctx.ellipse(off, -STUD_HEIGHT     - off, STUD_RADIUS, STUD_RADIUS * 0.36, 0, 0, Math.PI);  //Bottom of column
            ctx.ellipse(off, -STUD_HEIGHT * 2 - off, STUD_RADIUS, STUD_RADIUS * 0.36, 0, Math.PI, 0);  //Top of column
            ctx.fill();

            // Stud top style
            ctx.fillStyle = this.colorBright;

            // Stud top
            ctx.beginPath();
            ctx.ellipse(off, -STUD_HEIGHT * 2 - off, STUD_RADIUS, STUD_RADIUS * 0.36, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Draw holes in studs if they are grey
            if(this.isGrey) {
                // Stud grey hole style
                ctx.fillStyle = this.color;

                // Stud grey hole
                ctx.beginPath();
                ctx.ellipse(off, -STUD_HEIGHT * 2 - off, STUD_RADIUS * 0.6, STUD_RADIUS * 0.216, 0, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
}