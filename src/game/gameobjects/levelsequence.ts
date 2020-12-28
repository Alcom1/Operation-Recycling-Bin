import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

interface LevelSequenceParams extends GameObjectParams {
    font?: string;
    color?: string;
    levelName: string;
    levels: {[label: string]: string}
}

export default class LevelSequence extends GameObject {
    private font: string;
    private color: string;
    private levelName: string;
    public levels: {
        /** Level label */
        label: string;
        /** Level name */
        level: string;
    }[];

    constructor(engine: Engine, params: LevelSequenceParams) {
        super(engine, params);

        this.font = params.font || "18pt Consolas";
        this.color = params.color || "white";
        this.levelName = params.levelName;

        //Map levels to array of name-level objects
        this.levels = Object.entries(params.levels ?? {}).map(l => ({
            label : l[0],
            level : l[1]
        }));
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.textBaseline = "top";
        ctx.textAlign = "right";
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.levelName, 0, 1);
    }
}
