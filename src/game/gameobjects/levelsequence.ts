import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";

/** Parameters for a level sequence */
interface LevelSequenceParams extends GameObjectParams {
    font?: string;
    color?: string;
    levelName: string;
    hint: string;
    levels: {[label: string]: string}
    par: number;
}

/** */
export default class LevelSequence extends GameObject {

    /** Level name display font */
    private font: string;
    /** Level name display color */
    private color: string;

    /** Publicly exposed level names for next & prev */
    public levels: {
        /** Level label */
        label: string;
        /** Level name */
        level: string;
    }[];

    /** Publically exposed level name */
    public levelName: string;
    /** Publically exposed par for counter */
    public par: number;
    /** Publically exposed hint text */
    public hint: string;

    /** Constructor */
    constructor(params: LevelSequenceParams) {
        super(params);

        this.font = params.font || "24px Font04b_08";
        this.color = params.color || "white";
        this.levelName = params.levelName;
        this.hint = params.hint;

        // Map levels to array of name-level objects
        this.levels = Object.entries(params.levels ?? {}).map(l => ({
            label : l[0],
            level : l[1]
        }));

        this.par = params.par;
    }

    /** Draw the level name */
    public draw(ctx: CanvasRenderingContext2D) {

        ctx.textAlign = "right";
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.levelName, 0, 20);
    }
}
