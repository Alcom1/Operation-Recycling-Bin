import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

interface FPSCounterParams extends GameObjectParams {
    font?: string;
    color?: string;
}

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
    public update(dt: number) {
        //FPS is inverted delta time, measure to a single decimal point.
        this.text = "fps: " + (1 / dt).toFixed(1);
    }
    public draw(ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "top";
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 1); 
    }
}
