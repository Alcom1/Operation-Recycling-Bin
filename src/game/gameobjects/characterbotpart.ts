import { Z_DEPTH } from "engine/utilities/math";
import Sprite, { SpriteParams } from "./sprite";

export interface CharacterBotPartParams extends SpriteParams {

    index : number;
}

interface PartBounce {
    speed : number,
    accel : number
}

/** Single image gameobject */
export default class CharacterBotPart extends Sprite {

    private _index : number;
    public get index() : number { return this._index };
    private bounceIndex : number = 0;
    private bounces : PartBounce[] = [{
        speed : -150,
        accel : 600
    },{
        speed : -50,
        accel : 250
    }];

    /** Constructor */
    constructor(params: CharacterBotPartParams) {
        super(params);

        this._index = params.index;
    }

    /** Update position to bounce once active */
    public update(dt: number) {

        //If bouncing
        if(this.bounceIndex < this.bounces.length) {

            this.spos.y += this.bounces[this.bounceIndex].speed * dt * this._index;
            this.bounces[this.bounceIndex].speed += this.bounces[this.bounceIndex].accel * dt;
        }
        //If bounce is complete, increment to next bounce
        if(this.spos.y > Z_DEPTH) {

            this.spos.y = Z_DEPTH;
            this.bounceIndex++;
        }
    }
}