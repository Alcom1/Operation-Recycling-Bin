import Button, { ButtonParams } from "./button";
import LevelSequence from "./levelsequence";

export interface ButtonSceneParams extends ButtonParams {
    sceneName?: string;
    isLevelScene?: boolean;
}

export default class ButtonScene extends Button {

    private sceneName: string | null = null;
    private isLevelScene: boolean;

    /** Also set scene name if there is one */
    constructor(params: ButtonSceneParams) {
        super(params);

        this.sceneName = params.sceneName ?? null;
        this.isLevelScene = params.isLevelScene ?? true;
    }

    /** Initialize this scene button */
    public init(ctx: CanvasRenderingContext2D) {
        super.init(ctx);

        //If the scene name hasn't been set yet, attempt to get it from the level sequence.
        if(!this.sceneName) {

            // Get level sequence for the current level
            const levelSequence = this.engine.tag.get("LevelSequence", "Level")[0] as LevelSequence;
    
            // Get current level
            const levelCurrentTag = this.engine.tag.getScene("Level")?.tag;
    
            // If the current level has a sequence,
            // get the level in the sequence that matches this button's name
            // otherwise, get the current level for a restart
            if (levelSequence) {
                this.sceneName = levelSequence.levels.find(l => 
                    l.label.toLowerCase() === 
                    this.text.split(' ').join('').toLowerCase())?.level ?? levelCurrentTag ?? null;
            }
        }
    }

    /** Scene button action */
    protected doButtonAction() {

        // Go to new scene if this button has a scene name
        if (this.sceneName) {
            this.engine.killAllScenes();                // Set all scenes to be unloaded
            this.engine.pushScenes(this.sceneName);     // Push this button's scene name to be loaded

            //If this is a level scene, also load the level interface
            if(this.isLevelScene) {
                this.engine.pushScenes("LevelInterface");   // Push level interface to be loaded
            }
        }
    }
}
