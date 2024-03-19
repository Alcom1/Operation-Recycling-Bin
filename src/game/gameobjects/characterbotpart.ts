import { Z_DEPTH } from "engine/utilities/math";
import SpriteSet, { SpriteParams } from "./spriteset";

export interface CharacterBotPartParams extends SpriteParams {
    index : number;
}

interface LiftStage {
    speed : number,
    accel : number,
    split : number,
    end : number
}

/** Single image gameobject */
export default class CharacterBotPart extends SpriteSet {

    private _index : number;            //Index of this part
    public get index() : number { return this._index };
    private stageIndex : number = 0;    //Current stage for this part's lift effect
    private stages : LiftStage[] = [{ //Stages for lift effects
        speed : -250,
        accel : 0,
        split : 0,
        end : 0
    },{
        speed : -250,
        accel : 750,
        split : -36,
        end : Z_DEPTH
    }];
    private indexOffsets : number[] = [0, 1, 2.3, 3];   // y-offset of each part by its index
    private indexEmoteTimer = 0;                        // How long current emote has been active
    private indexEmoteTimerLimits : number[] = [        // Limit for timer, when next emote is used
        0.1, 
        0.8,
        0.1];
    private indexEmote = 0;                             // Index of current emote
    private indexEmotes : number[][] = [                // Sprite indexes for each emote
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 2, 1, 0],
        [1, 3, 2, 1]];

    /** Constructor */
    constructor(params: CharacterBotPartParams) {
        super(params);

        this._index = params.index;

        this.imageIndex = this.indexEmotes[0][this.index];
    }

    /** Update position to bounce once active */
    public update(dt: number) {

        //Update if there are still emotions to display
        if(this.indexEmote < this.indexEmotes.length - 1) {

            this.indexEmoteTimer += dt;

            //If next emotion is ready
            if(this.indexEmoteTimer > this.indexEmoteTimerLimits[this.indexEmote]) {

                //Increment and display next emotion
                this.indexEmote++;
                this.imageIndex = this.indexEmotes[this.indexEmote][this.index];
                this.indexEmoteTimer = 0;
            }
        }

        //Only update if not the bottom part, and if there are still stages left
        if (this.index > 0 && this.stageIndex < this.stages.length) {

            //Current stage
            let stage = this.stages[this.stageIndex];

            //Update vertical position and speed
            this.spos.y += (stage.speed + stage.split * this.indexOffsets[this.index]) * dt;
            stage.speed += stage.accel * dt;

            //Check if end of this stage has been reached, go to next stage
            if ((stage.end < -20 && this.spos.y < stage.end) ||
                (stage.end > -20 && this.spos.y > stage.end)) {
                
                this.stageIndex++;
            }
        }
        //If there are no stages to run, reset position
        else {

            this.spos.y = Z_DEPTH;
        }
    }
}