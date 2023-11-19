import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

/** Parameters for an FPS counter */
interface FPSCounterParams extends GameObjectParams {
    font?: string;
    color?: string;
}

/** FPS counter, it displays the frames per second */
export default class FPSCounter extends GameObject {

    private font: string;
    private color: string;
    private text: string = '';

    /** Constructor */
    constructor(params: FPSCounterParams) {
        super(params);
        this.font = params.font ?? "18pt Consolas";
        this.color = params.color || "white";
    }

    /** Update FPS display text */
    public update(dt: number) {
        // FPS is inverted delta time, measure to a single decimal point.
        let fps = (1 / dt).toFixed(1);
        this.text = "fps:" + this.getSpaces(6 - fps.length) + fps;
    }

    /** Get spaces for FPS display */
    private getSpaces(count: number) : string {

        var ret = "";

        for (let i = 0; i < count; i++) {
            ret += " ";
        }

        return ret;
    }

    /** Draw fps display */
    public draw(ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "top";
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 1); 
    }
}
