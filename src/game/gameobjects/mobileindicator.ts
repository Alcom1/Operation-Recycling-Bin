import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY, round, Z_DEPTH } from "engine/utilities/math";
import Vect from "engine/utilities/vect";

export default class MobileIndicator extends GameObject {

    private mobileOffset: Vect = new Vect(0, 0);
    private isSnapped: Boolean = false;

    /** Boundary offset for minimum carried position */
    private minBox : Vect = new Vect(0, 0);

    /** Boundary offset for maximum carried position */
    private box : Vect = new Vect(0, 0);

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

        ctx.beginPath();
        ctx.rect(
           -GMULTX * 1 + 8, 
           -GMULTY * (this.box.y + 4.5) - 10,
            GMULTX * (this.box.x + 2),
            GMULTY * (this.box.y + 2));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.translate(GMULTX * this.box.x / 2 + 5, 0);
        ctx.beginPath();
        ctx.moveTo(20, -101.5);
        ctx.lineTo(0, -50);
        ctx.lineTo(-20, -101.5);
        ctx.fill();
        ctx.stroke();

        // ctx.beginPath();
        // ctx.rect(
        //    -GMULTX * 1 + 8, 
        //    -GMULTY * (this.box.y + 4.5) - 10,
        //     GMULTX * (this.box.x + 2),
        //     GMULTY * (this.box.y + 2));
        // ctx.closePath();
        // ctx.fill();
        // ctx.stroke();

        // ctx.translate(GMULTX * this.box.x / 2 + 5, 0);
        // ctx.beginPath();
        // ctx.moveTo(-20, -100);
        // ctx.lineTo(20, -100);
        // ctx.lineTo(0, -50);
        // ctx.closePath();
        // ctx.fill();
        // ctx.stroke();
    }

    public setMinMax(min: Vect, max: Vect, spos : Vect): void {

        //Do not activate if a mouse is being used
        this.isActive = true;

        //Set box that collides with boundary
        this.box = max.getSub(min);

        //Set the offset of the indicator
        this.mobileOffset = spos.getSub({
            x : min.x * GMULTX, //(min.x + max.x) * GMULTX / 2, 
            y : min.y * GMULTY
        });
    }

    public snap(state : Boolean) {
        this.isSnapped = state;
    }
}
