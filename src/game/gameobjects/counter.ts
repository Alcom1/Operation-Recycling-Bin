import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { GMULTX } from "engine/utilities/math";
import LevelSequence from "./levelsequence";

/** Counter parameters */
interface CounterParams extends GameObjectParams {
    fontFamily?: string;
}

/** Counter that keeps track of the move count */
export default class Counter extends GameObject {

    private _par: number = 1;           // Current par
    public get par() : number {         // Exposed par
        return this._par; 
    }
    
    private _count : number = 0;        // Current count
    public get count() : number {       // Exposed count
        return this._count; 
    }

    public get underPar() : boolean {   // Exposed par status
        return this._par >= this._count;
    }

    private fontFamily: string = "";    // Font for count display
    
    /** Constructor */
    constructor(params: CounterParams) {
        super(params);

        this.fontFamily = params.fontFamily ?? "Font04b_08";
    }    
    
    /** Get current level and its par */
    public init(): void {
        
        this._par = (
            this.engine.tag.get(
                "LevelSequence", 
                "Level")[0] as LevelSequence).par;
    }

    /** Increment the move count (called when bricks are moved) */
    public incrementCount() {
        this._count++;
    }

    /** Draw the current count */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.textAlign = "right";
        
        // Current score
        ctx.fillStyle = "#DD9C00";
        ctx.font = "32px " + this.fontFamily;
        ctx.fillText("" + this._count, GMULTX * 35 + 200, 450);
        
        // Par
        ctx.fillStyle = "#000";
        ctx.font = "16px " + this.fontFamily;
        ctx.fillText(this._par + " or fewer", GMULTX * 35 + 203, 484);

        // Par checkbox
        if (this.underPar) {
            ctx.fillStyle = "#FFCC00"
            ctx.fillRect(GMULTX * 35 + 56, 472, 12, 12);
        }
    }
}