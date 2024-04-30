import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import Character from "./character";

/** Handles signs and pausing for signs */
export default class Signage extends GameObject {

    private binCount : number = 0;
    private binEaten : number = 0;
    private level : Scene | null = null;

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);
    }

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init(ctx: CanvasRenderingContext2D) {

        this.binCount = this.engine.tag.get(
            "CharacterBin", 
            "Level").length;

        this.level = this.engine.tag.getScene("Level");
    }

    public incrementEaten() {
        this.binEaten++;

        if(this.binCount > 0 && this.binEaten >= this.binCount) {

            this.level?.pause();
        }
    }
}