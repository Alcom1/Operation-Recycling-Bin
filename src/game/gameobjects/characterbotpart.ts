import { Z_DEPTH } from "engine/utilities/math";
import Sprite, { SpriteParams } from "./sprite";

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
export default class CharacterBotPart extends Sprite {

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

    /** Constructor */
    constructor(params: CharacterBotPartParams) {
        super(params);

        this._index = params.index;
    }

    /** Update position to bounce once active */
    public update(dt: number) {

        //Only update if not the bottom part, and if there are still stages left
        if (this.index > 0 && this.stageIndex < this.stages.length) {

            //Current stage
            let stage = this.stages[this.stageIndex];

            //Update vertical position and speed
            this.spos.y += (stage.speed + stage.split * this.index) * dt;
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