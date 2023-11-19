import BrickTile from "./bricktile.js";
import Sprite from "./sprite.js";
export default class BrickTileTop extends BrickTile {
  constructor(params) {
    super(Object.assign(params, {width: 2}));
    this.isShowTopIfOn = true;
    this.topSprite = this.parent.pushGO(new Sprite({
      ...params,
      tags: ["Misc"],
      position: this.gpos.getAdd({x: 0, y: -1}),
      image: params.imageTop,
      size: {x: params.width ?? 2, y: 0}
    }));
    this.isShowTopIfOn = params.isShowTopIfOn ?? true;
    this.topSprite.isActive = this.isOn == this.isShowTopIfOn;
  }
  select(pos) {
    super.select(pos);
    this.setOnOff(true);
  }
  deselect() {
    super.deselect();
    this.topSprite.gpos = this.gpos.getAdd({x: 0, y: -1});
  }
  setOnOff(state) {
    super.setOnOff(state);
    this.topSprite.isActive = state == this.isShowTopIfOn;
  }
}
//# sourceMappingURL=bricktiletop.js.map
