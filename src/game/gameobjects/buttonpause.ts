import Scene from "engine/scene/scene";
import Button from "./button";
import LevelSequence from "./levelsequence";

export default class ButtonPause extends Button {

    /** Level scene to track pausing */
    private levelScene: Scene | null = null;
    /** If level is paused */
    private isPaused : boolean = false;

    /** Initialize this scene button */
    public init(ctx: CanvasRenderingContext2D) {
        super.init(ctx);

        this.levelScene = this.engine.tag.getScene("Level");
    }

    /** Scene button action */
    protected doButtonAction() {

        if(this.isPaused) {
            this.levelScene?.unpause();
        }
        else {
            this.levelScene?.pause();
        }
        this.isPaused = !this.isPaused;
    }
}
