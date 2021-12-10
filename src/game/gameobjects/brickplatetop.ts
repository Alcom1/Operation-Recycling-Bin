import { Point } from "engine/utilities/vect";
import BrickPlate, { BrickPlateParams } from "./brickplate";
import Sprite, { SpriteParams } from "./sprite";

export interface BrickPlateTopParams extends BrickPlateParams {
    imageTop : string
    isOnShowTop? : boolean
}

//Brick with a top sprite, like a jump
export default class BrickPlateTop extends BrickPlate {

    private topSprite : Sprite;             //The sprite to be shown on top of this brick
    private isOnShowTop : boolean = true;   //If the top sprite should be active for the ON or OFF state.

    constructor(params: BrickPlateTopParams) {
        super(Object.assign(params, { width : 2 }));

        //Create top sprite
        this.topSprite = this.parent.pushGO(
            new Sprite({
                    ...params,
                    position : this.gpos.getAdd({x : 0, y : -1}),   //Top sprite is 1 grid above this brick
                    image : params.imageTop
                } as SpriteParams)) as Sprite

        this.topSprite.setZIndex(10);                               //Top sprite is above this one

        this.isOnShowTop = params.isOnShowTop ?? true;              //Top sprite show condition
        this.topSprite.isActive = this.isOn == this.isOnShowTop;    //Deactivate top sprite if it starts hidden
    }

    public select(pos : Point) {
        super.select(pos);
        this.setOnOff(true);
    }

    public deselect() {
        super.deselect();
        this.topSprite.gpos = this.gpos.getAdd({x : 0, y : -1});
        this.topSprite.setZIndex(10);
    }

    protected setOnOff(state : boolean) {
        super.setOnOff(state);
        this.topSprite.isActive = state == this.isOnShowTop;
    }
}
