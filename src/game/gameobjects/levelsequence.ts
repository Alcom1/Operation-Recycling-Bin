import ZGameObject, { ZGameObjectParams } from "./zgameobject";

interface LevelSequenceParams extends ZGameObjectParams {
    font?: string;
    color?: string;
    levelName: string;
    levels: {[label: string]: string}
    par: number;
}

export default class LevelSequence extends ZGameObject {
    private font: string;
    private color: string;
    private levelName: string;
    public levels: {
        /** Level label */
        label: string;
        /** Level name */
        level: string;
    }[];
    public par: number;

    /** Constructor */
    constructor(params: LevelSequenceParams) {
        super(params);

        this.font = params.font || "24px Font04b_08";
        this.color = params.color || "white";
        this.levelName = params.levelName;

        //Map levels to array of name-level objects
        this.levels = Object.entries(params.levels ?? {}).map(l => ({
            label : l[0],
            level : l[1]
        }));

        this.par = params.par;
    }

    public draw(ctx: CanvasRenderingContext2D) {

        ctx.textBaseline = "top";
        ctx.textAlign = "right";
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.levelName, 0, 1);
    }
}
