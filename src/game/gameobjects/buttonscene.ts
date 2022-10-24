import Button from "./button";
import LevelSequence from "./levelsequence";

export default class ButtonScene extends Button {
    private sceneName: string | null = null;

    /** Initialize this scene button */
    public init(ctx: CanvasRenderingContext2D) {
        super.init(ctx);

        //Get level sequence for the current level
        const levelSequence = this.engine.tag.get("LevelSequence", "Level")[0] as LevelSequence;

        // If the current level has a sequence,
        // get the level in the sequence that matches this button's name
        if (levelSequence) {
            this.sceneName = levelSequence.levels.find(l => 
                l.label.toLowerCase() === 
                this.text.split(' ').join('').toLowerCase())?.level ?? null;
        }
    }

    /** Scene button action */
    protected doButtonAction() {

        // Go to new scene if this button has a scene name
        if (this.sceneName) {
            this.engine.killAllScenes();                // Set all scenes to be unloaded
            this.engine.pushScenes(this.sceneName);     // Push this button's scene name to be loaded
            this.engine.pushScenes("LevelInterface");   // Push level interface to be loaded
        }
    }
}
