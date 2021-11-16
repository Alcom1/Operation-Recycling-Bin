import BrickPlate from "./brickplate.js";
import Sprite from "./sprite.js";
export default class BrickPlateTop extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, {width: 2}));
    this.isOnTop = true;
    var topGPos = this.gpos.getAdd({x: 0, y: -1});
    this.topSprite = this.parent.pushGO(new Sprite({
      ...params,
      position: topGPos,
      image: params.imageTop
    }));
    this.topSprite.setZIndex(10);
    this.isOnTop = params.isOnTop ?? true;
    this.topSprite.isActive = this.isOn == this.isOnTop;
  }
  select(pos) {
    super.select(pos);
    this.setOnOff(true);
  }
  deselect() {
    super.deselect();
    this.topSprite.gpos = this.gpos.getAdd({x: 0, y: -1});
    this.topSprite.setZIndex(10);
  }
  setOnOff(state) {
    super.setOnOff(state);
    this.topSprite.isActive = state == this.isOnTop;
  }
}
//# sourceMappingURL=brickplatetop.js.map
