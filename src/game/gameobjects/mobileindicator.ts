import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, round } from "engine/utilities/math";
import Vect, { Point }  from "engine/utilities/vect";
import Brick from "./bricknormal";

export default class MobileIndicator extends GameObject {
    private mobileOffset : Vect = new Vect(0, 0);
    private isSnapped : boolean = false;
    private isFlipped : boolean = false;

    /** Boundary offset for minimum carried position */
    private minBox : Vect = new Vect(0, 0);

    /** Boundary offset for maximum carried position */
    private box : Vect = new Vect(0, 0);

    /** Bricks */
    private bricks : Brick[] = [];

    /** Stored cursor position from moment of selection */
    private _cursorPosition : Vect = new Vect(0, 0);
    public set cursorPosition(value : Vect) {
        this._cursorPosition = value;
    }

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        this.isActive = false;
    }
    public init(ctx: CanvasRenderingContext2D) {
        
        this.bricks = this.engine.tag.get(  // Get bricks from scene
            "Brick", 
            "Level") as Brick[];
    }    
    public update(dt: number) {

        this.spos = this.engine.mouse.getPos().getSub(this.mobileOffset).getClamp({
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
                
        //Grid positioning
        if (this.isSnapped) {
            this.spos.set({
                x : round(this.spos.x, GMULTX),
                y : round(this.spos.y, GMULTY)
            });
        }

        this.isFlipped = this.spos.y < GMULTY * (this.box.y + 5);
        this.bricks.filter(b => b.isSelected).forEach(b => b.flipMobile(this.isFlipped));
    }
    public draw(ctx: CanvasRenderingContext2D) {
        
        if (this.engine.mouse.getMouseType() == "mouse" ||
           !MOBILE_PREVIEW_MAX.getLessOrEqual(this.box)) {
            return;
        }

        //Offset to rotate about center;
        ctx.translate(
            GMULTX * this.box.x / 2 + 10,
            GMULTY * this.box.y / 2 - 15);

        //Rotate if cursor is too high
        if (this.isFlipped) {
            ctx.rotate(Math.PI);
        }

        ctx.fillStyle = "#EEE"
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 25;

        const pos : Point = {                                   //Position of the indicator window
            x: -GMULTX * (this.box.x * 0.5 + 1  ),
            y: -GMULTY * (this.box.y * 1.5 + 4.5) + 5
        };        
        const size : Point = {                                  //Size of the indicator window
            x: GMULTX * (this.box.x + 2),
            y: GMULTY * (this.box.y + 2)
        };

        ctx.beginPath();
        ctx.moveTo(pos.x,          pos.y);
        ctx.lineTo(pos.x + size.x, pos.y);
        ctx.lineTo(pos.x + size.x, pos.y + size.y);
        //Start arrow
        ctx.lineTo( 20,            pos.y + size.y);
        ctx.lineTo( 0,             pos.y + size.y + 50);
        ctx.lineTo(-20,            pos.y + size.y);
        //End arrow
        ctx.lineTo(pos.x,          pos.y + size.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.stroke();
    }
    public setMinMax(min: Vect, max: Vect): void {

        //Activate
        this.isActive = true;

        //Set box that collides with boundary
        this.box = max.getSub(min);

        //Set the offset of the indicator
        this.mobileOffset = this._cursorPosition.getSub({
            x : min.x * GMULTX, //(min.x + max.x) * GMULTX / 2, 
            y : min.y * GMULTY
        });
    }
    public snap(state : boolean) {

        this.isSnapped = state;
    }
}
