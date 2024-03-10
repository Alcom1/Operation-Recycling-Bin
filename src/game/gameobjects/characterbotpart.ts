import { Z_DEPTH } from "engine/utilities/math";
import Sprite, { SpriteParams } from "./sprite";

export interface CharacterBotPartParams extends SpriteParams {

    index : number;
}

/** Single image gameobject */
export default class CharacterBotPart extends Sprite {

    private _index : number;
    public get index() : number { return this._index };
    private isBouncing = true;
    private speed = -100;
    private accel = 200;
    private timer = 0;

    /** Constructor */
    constructor(params: CharacterBotPartParams) {
        super(params);

        this._index = params.index;
    }

    /** Update position to bounce once active */
    public update(dt: number) {

        if(this.isBouncing) {
            this.timer += dt;
            this.spos.y += this.speed * dt * this._index;
            this.speed += this.accel * dt;
        }
        if(this.spos.y > Z_DEPTH) {
            console.log(this.timer);
            this.spos.y = Z_DEPTH;
            this.isBouncing = false;
        }
    }
}