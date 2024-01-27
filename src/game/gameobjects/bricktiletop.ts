import { Point } from "engine/utilities/vect";
import BrickTile, { BrickTileParams } from "./bricktile";
import Sprite, { SpriteParams } from "./sprite";

export interface BrickTileTopParams extends BrickTileParams {
    imageTop : string
    imageTopExtension? : string,
    isShowTopIfOn? : boolean
}

/** Tile with a top plate, like a jump */
export default class BrickTileTop extends BrickTile {

    private topSprite : Sprite;             // The sprite to be shown on top of this brick
    private isShowTopIfOn : boolean = true; // If the top sprite should be active for the ON or OFF state.

    /** Constructor */
    constructor(params: BrickTileTopParams) {
        super(Object.assign(params, { width : 2 }));

        // Create top sprite
        this.topSprite = this.parent.pushGO(
            new Sprite({
                    ...params,
                    tags: ["Misc"],
                    position : this.gpos.getAdd({x : 0, y : -1}),   // Top sprite is 1 grid above this brick
                    image : params.imageTop,
                    extension : params.imageTopExtension,
                    size : { x : params.width ?? 2, y : 0 }
                } as SpriteParams)) as Sprite

        this.isShowTopIfOn = params.isShowTopIfOn ?? true;          // Top sprite show condition
        this.topSprite.isActive = this.isOn == this.isShowTopIfOn;  // Deactivate top sprite if it starts hidden
    }

    /** Selecting a tile turns it on. */
    public select(pos : Point) {
        super.select(pos);

        this.setOnOff(true);
    }

    /** Deselecting a tile moves the top sprite to match its position*/
    public deselect() {
        super.deselect();

        this.topSprite.gpos = this.gpos.getAdd({x : 0, y : -1});
    }

    /** Set on/off state and top plate to match */
    public setOnOff(state : boolean) {
        super.setOnOff(state);

        this.topSprite.isActive = state == this.isShowTopIfOn;
    }
}
