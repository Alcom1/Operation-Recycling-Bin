import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { colorTranslate, GMULTX, GMULTY, UNDER_CURSOR_Z_INDEX, Z_DEPTH } from "engine/utilities/math";

interface BrickStudParams extends GameObjectParams {
    color?: string;
}

/** Series of studs for a brick */
export default class BrickStud extends GameObject {
    color: string;

    image : HTMLImageElement;

    isPressed = false;
    isSelected = false;
    isSnapped = false;
    isVisible = true;

    constructor(engine: Engine, params: BrickStudParams) {
        super(engine, params);

        this.color = colorTranslate(params.color);

        this.zIndex =          // Z-sort vertically and then horizontally.
            this.gpos.x * 2 -  // 2x multiplier for stud overlap
            this.gpos.y * 100  // Y-pos has priority over X-pos.
            + 1;               // Plus one for stud overlap

        this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "").toLowerCase()}`);
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
}