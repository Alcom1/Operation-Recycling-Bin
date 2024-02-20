import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { TouchStyle } from "engine/modules/settings";
import { BOUNDARY, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, round } from "engine/utilities/math";
import Vect, { Point }  from "engine/utilities/vect";
import Brick from "./bricknormal";

/** Selection indicator for mobile devices */
export default class MobileIndicator extends GameObject {
    
    /** Position offset of the indicator */
    private mobileOffset : Vect = Vect.zero;
    /** If selection is snapped */
    private isSnapped : boolean = false;
    /** If indicator is flipped to fit in window */
    private isFlipped : boolean = false;

    /** Boundary offset for minimum carried position */
    private minBox : Vect = Vect.zero;

    /** Boundary offset for maximum carried position */
    private box : Vect = Vect.zero;

    /** Bricks */
    private bricks : Brick[] = [];

    /** Stored cursor position from moment of selection */
    private _cursorPosition : Vect = Vect.zero;
    public set cursorPosition(value : Vect) {
        this._cursorPosition = value;
    }

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        this.isActive = false;
    }

    /** initialize */
    public init(ctx: CanvasRenderingContext2D) {
        
        this.bricks = this.engine.tag.get(  // Get bricks from scene
            "Brick", 
            "Level") as Brick[];
    }    

    /** Update the indicator to match mouse position. */
    public update(dt: number) {

        // Get mouse position, clamped within level borders.
        this.spos = this.engine.mouse.pos.getSub(this.mobileOffset).getClamp({
            // Clamp above minimum-x position
            x: (BOUNDARY.minx) * GMULTX,
            // Clamp above minimum-y position
            y: (BOUNDARY.miny) * GMULTY
        }, {  
            // Clamp below maximum-x position
            x: (BOUNDARY.maxx - this.box.x) * GMULTX,
            // Clamp below maximum-y position
            y: (BOUNDARY.maxy - this.box.y) * GMULTY
        });
                
        // Grid positioning
        if (this.isSnapped) {
            this.spos.set({
                x : round(this.spos.x, GMULTX),
                y : round(this.spos.y, GMULTY)
            });
        }

        // Flip check
        this.isFlipped = this.spos.y < GMULTY * (this.box.y + 5);                           // Flip if mouse is too high
        this.bricks.filter(b => b.isSelected).forEach(b => b.flipMobile(this.isFlipped));   // Flip all bricks
    }
    
    /** Draw this preview */
    public draw(ctx: CanvasRenderingContext2D) {
        
        if (this.engine.mouse.getMouseType() == "mouse" ||
            this.engine.settings.getNumber("touchStyle") != TouchStyle.PREV ||
           !MOBILE_PREVIEW_MAX.getLessOrEqual(this.box)) {
            return;
        }

        // Offset to rotate about center;
        ctx.translate(
            GMULTX * this.box.x / 2 + 10,
            GMULTY * this.box.y / 2 - 15);

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
            x: -GMULTX * (this.box.x * 0.5 + 1  ),
            y: -GMULTY * (this.box.y * 1.5 + 4.5) + 5
        };        
        const size : Point = {                                  // Size of the indicator window
            x: GMULTX * (this.box.x + 2),
            y: GMULTY * (this.box.y + 2)
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

        // Activate
        this.isActive = true;

        // Set box that collides with boundary
        this.box = max.getSub(min);

        // Set the offset of the indicator
        this.mobileOffset = this._cursorPosition.getSub({
            x : min.x * GMULTX, // (min.x + max.x) * GMULTX / 2, 
            y : min.y * GMULTY
        });
    }
    
    /** Set snapped state (should be a setter?) */
    public snap(state : boolean) {

        this.isSnapped = state;
    }
}
