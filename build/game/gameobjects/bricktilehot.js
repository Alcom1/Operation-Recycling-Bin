import {MASKS} from "../../engine/utilities/math.js";
import Anim from "./anim.js";
import BrickTile from "./bricktile.js";
const BrickTileHotOverride = Object.freeze({
  images: ["brick_tile", "brick_tile_hot"],
  width: 4
});
export default class BrickTileHot extends BrickTile {
  get zIndex() {
    return super.zIndex;
  }
  set zIndex(value) {
    super.zIndex = value;
    this.animation.zIndex = value;
  }
  constructor(params) {
    super(Object.assign(params, BrickTileHotOverride));
    this.animation = this.parent.pushGO(new Anim({
      ...params,
      subPosition: {x: 0, y: -25},
      images: [{name: "brick_tile_hot"}],
      speed: 2,
      frameCount: 7,
      isVert: true
    }));
    this.animation.isActive == this.isOn;
  }
  draw(ctx) {
    if (!this.isOn) {
      super.draw(ctx);
    }
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? [{
      mask: MASKS.death,
      min: this.gpos.getAdd({x: 1, y: -1}),
      max: this.gpos.getAdd({x: this.width - 1, y: 0})
    }] : []);
  }
}
//# sourceMappingURL=bricktilehot.js.map
