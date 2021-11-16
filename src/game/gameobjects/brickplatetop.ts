import { Point } from "engine/utilities/vect";
import BrickPlate, { BrickPlateParams } from "./brickplate";
import Sprite, { SpriteParams } from "./sprite";

export interface BrickPlateTopParams extends BrickPlateParams {
    imageTop : string
    isOnTop? : boolean
}

export default class BrickPlateTop extends BrickPlate {

    private topSprite : Sprite;
    private isOnTop : boolean = true;

    constructor(params: BrickPlateTopParams) {
        super(Object.assign(params, { width : 2, isOn : true }));

        var topGPos = this.gpos.getAdd({x : 0, y : -1});

        this.topSprite = this.parent.pushGO(
            new Sprite({
                    ...params,
                    position : topGPos,
                    image : params.imageTop
                } as SpriteParams)) as Sprite

        this.topSprite.setZIndex(10);

        this.isOnTop = params.isOnTop ?? true;
        this.topSprite.isActive = this.isOn == this.isOnTop;
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
        this.topSprite.isActive = state == this.isOnTop;
    }
}
