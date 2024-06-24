import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

/** Parameters for an FPS counter */
interface FPSCounterParams extends GameObjectParams {
    font?: string;
    color?: string;
    hasBackground?: boolean;
}

/** FPS counter, it displays the frames per second */
export default class FPSCounter extends GameObject {

    private font: string;
    private color: string;
    private text: string = '';
    private hasBackground: boolean;

    /** Constructor */
    constructor(params: FPSCounterParams) {
        super(params);
        this.font = params.font ?? "18pt Consolas";
        this.color = params.color || "white";
        this.hasBackground = params.hasBackground ?? false;
    }

    /** Update FPS display text */
    public update(dt: number) {
        // FPS is inverted delta time, measure to a single decimal point.
        let fps = (1 / dt).toFixed(1);
        this.text = "fps:" + this.getSpaces(6 - fps.length) + fps;
    }

    /** Get spaces for FPS display */
    private getSpaces(count: number) : string {

        let ret = "";

        for (let i = 0; i < count; i++) {
            ret += " ";
        }

        return ret;
    }

    /** Draw fps display */
    public draw(ctx: CanvasRenderingContext2D) {

        if(this.hasBackground) {
            debugger;

            ctx.fillStyle = "#7F8887";
            ctx.fillRect(0, 0, 150, 26);
        }
        
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 20); 
    }
}
