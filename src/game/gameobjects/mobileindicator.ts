import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY, round, Z_DEPTH } from "engine/utilities/math";
import Vect, { Point }  from "engine/utilities/vect";

export default class MobileIndicator extends GameObject {

    private mobileOffset: Vect = new Vect(0, 0);
    private isSnapped: Boolean = false;

    /** Boundary offset for minimum carried position */
    private minBox : Vect = new Vect(0, 0);

    /** Boundary offset for maximum carried position */
    private box : Vect = new Vect(0, 0);

    /** */
    private _cursorPosition : Vect = new Vect(0, 0);
    public set cursorPosition(value : Vect) {
        this._cursorPosition = value;
    }

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, params);

        this.isActive = false;
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
    }

    public draw(ctx: CanvasRenderingContext2D) {
        
        if(this.engine.mouse.getMouseType() == "mouse") {
            return;
        }

        ctx.fillStyle = "#EEE"
        ctx.strokeStyle = "#666"
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 25;

        const offsetX = 9;                                  //X-offset of the entire indicator
        const offsetA = GMULTX * this.box.x / 2 + offsetX;  //X-offset of the arrow
        const pos : Point = {                               //Position of the indicator window
            x: -GMULTX * 1 + offsetX,
            y: -GMULTY * (this.box.y + 4.5) - 10
        };        
        const size : Point = {                              //Size of the indicator window
            x: GMULTX * (this.box.x + 2),
            y: GMULTY * (this.box.y + 2)
        };

        ctx.beginPath();
        ctx.moveTo(pos.x,          pos.y);
        ctx.lineTo(pos.x + size.x, pos.y);
        ctx.lineTo(pos.x + size.x, pos.y + size.y);         //pos.y + size.y is literally 100, but whatever
        //Start arrow
        ctx.lineTo(offsetA + 20,   pos.y + size.y);
        ctx.lineTo(offsetA     ,   pos.y + size.y + 50);
        ctx.lineTo(offsetA - 20,   pos.y + size.y);
        //End arrow
        ctx.lineTo(pos.x,          pos.y + size.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.stroke();
    }

    public setMinMax(min: Vect, max: Vect): void {

        //Do not activate if a mouse is being used
        this.isActive = true;

        //Set box that collides with boundary
        this.box = max.getSub(min);

        //Set the offset of the indicator
        this.mobileOffset = this._cursorPosition.getSub({
            x : min.x * GMULTX, //(min.x + max.x) * GMULTX / 2, 
            y : min.y * GMULTY
        });
    }

    public snap(state : Boolean) {
        this.isSnapped = state;
    }
}
