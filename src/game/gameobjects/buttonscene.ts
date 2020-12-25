import Scene from "engine/scene/scene";
import Button from "./button";
import LevelSequence from "./levelsequence";

export default class ButtonScene extends Button {
    private sceneName: string | null = null;

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]): void {
        super.init(ctx, scenes);
        //Get level sequence for the current level
        const levelSequence = this.engine.tag.get("LevelSequence", "Level")[0] as LevelSequence;

        // If the current level has a sequence,
        // get the level in the sequence that matches this button's name
        if (levelSequence) {
            this.sceneName = levelSequence.levels.find(l => l.label === this.text.split(' ').join(''))?.level ?? null;
        }
    }

    protected doButtonAction() {
        // Go to new scene if this button has a scene name
        if (this.sceneName) {
            this.engine.killAllScenes();                // Set all scenes to be unloaded
            this.engine.pushScenes(this.sceneName);     // Push this button's scene name to be loaded
            this.engine.pushScenes("level_interface");  // Push level interface to be loaded
        }
    }
}
