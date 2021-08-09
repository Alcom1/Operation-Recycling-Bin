import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";

interface CounterParams extends GameObjectParams {
    font?: string;
}


export default class Counter extends GameObject {

    private count : number = 0;
    private font: string = "";
    
    constructor(engine: Engine, params: CounterParams) {
        super(engine, params);

        this.font = params.font ?? "32px FiveByFive";
    }

    public incrementCount() {
        this.count++;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.textAlign = "right";
        ctx.font = this.font;
        ctx.fillStyle = "#DD9C00";
        ctx.fillText("" + this.count, GMULTX * 35 + 200, 450);
    }
}