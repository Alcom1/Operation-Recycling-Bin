import BrickPlate from "./brickplate.js";
import Sprite from "./sprite.js";
export default class BrickPlateTop extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, {width: 2}));
    this.isOnShowTop = true;
    this.topSprite = this.parent.pushGO(new Sprite({
      ...params,
      position: this.gpos.getAdd({x: 0, y: -1}),
      image: params.imageTop
    }));
    this.topSprite.setZIndex(10);
    this.isOnShowTop = params.isOnShowTop ?? true;
    this.topSprite.isActive = this.isOn == this.isOnShowTop;
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
    this.topSprite.isActive = state == this.isOnShowTop;
  }
}
//# sourceMappingURL=brickplatetop.js.map
