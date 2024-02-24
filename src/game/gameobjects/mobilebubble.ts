import { TouchStyle } from "engine/modules/settings";
import { BOUNDARY, GMULTX, GMULTY, round, TOUCH_EFFECT_MAX } from "engine/utilities/math";
import Vect, { Point }  from "engine/utilities/vect";
import Brick from "./bricknormal";
import MobileIndicator from "./mobileindicator";

/** Selection indicator for mobile devices */
export default class MobileBubble extends MobileIndicator {

    /** If indicator is flipped to fit in window */
    private isFlipped : boolean = false;

    /** Bricks */
    private bricks : Brick[] = [];

    /** initialize */
    public init(ctx: CanvasRenderingContext2D) {
        
        this.bricks = this.engine.tag.get(  // Get bricks from scene
            "Brick", 
            "Level") as Brick[];
    }    

    /** Update the indicator to match mouse position. */
    public update(dt: number) {
        super.update(dt);

        this.spos = this.getBoundaryClamp();

        // Grid positioning
        if (this.isSnapped) {
            this.spos.set({
                x : round(this.spos.x, GMULTX),
                y : round(this.spos.y, GMULTY)
            });
        }

        // Flip check
        this.isFlipped = this.spos.y < GMULTY * (this.size.y + 5);                          // Flip if mouse is too high
        this.bricks.filter(b => b.isSelected).forEach(b => b.flipMobile(this.isFlipped));   // Flip all bricks
    }
    
    /** Draw this preview */
    public draw(ctx: CanvasRenderingContext2D) {
        
        if (this.engine.mouse.mouseType == "mouse" ||
            this.engine.settings.getNumber("touchStyle") != TouchStyle.PREV ||
           !TOUCH_EFFECT_MAX.getLessOrEqual(this.size)) {
            return;
        }

        // Offset to rotate about center;
        ctx.translate(
            GMULTX * this.size.x / 2 + 10,
            GMULTY * this.size.y / 2 - 15);

        // Rotate if cursor is too high
        if (this.isFlipped) {
            ctx.rotate(Math.PI);
        }

        ctx.fillStyle = "#EEE"
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 25;

        const pos : Point = {                                   // Position of the indicator window
            x: -GMULTX * (this.size.x * 0.5 + 1  ),
            y: -GMULTY * (this.size.y * 1.5 + 4.5) + 5
        };        
        const size : Point = {                                  // Size of the indicator window
            x: GMULTX * (this.size.x + 2),
            y: GMULTY * (this.size.y + 2)
        };

        ctx.beginPath();
        ctx.moveTo(pos.x,          pos.y);
        ctx.lineTo(pos.x + size.x, pos.y);
        ctx.lineTo(pos.x + size.x, pos.y + size.y);
        // Start arrow
        ctx.lineTo( 20,            pos.y + size.y);
        ctx.lineTo( 0,             pos.y + size.y + 50);
        ctx.lineTo(-20,            pos.y + size.y);
        // End arrow
        ctx.lineTo(pos.x,          pos.y + size.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.stroke();
    }
    
    /** Set selection boundaries */
    public setMinMax(min: Vect, max: Vect): void {
        super.setMinMax(min, max);

        // Set the offset of the indicator
        this.mobileOffset = this._cursorPosition.getSub({
            x : min.x * GMULTX, // (min.x + max.x) * GMULTX / 2, 
            y : min.y * GMULTY
        });
    }
}
