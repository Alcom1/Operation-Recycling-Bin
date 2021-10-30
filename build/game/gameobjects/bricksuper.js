import {getZIndex} from "../../engine/utilities/math.js";
import BrickPlate from "./brickplate.js";
import Sprite from "./sprite.js";
const brickSuperOverride = Object.freeze({
  images: ["brick_super_off", "brick_super"],
  width: 2,
  isOn: true
});
export default class BrickSuper extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickSuperOverride));
    var topGPos = this.gpos.getAdd({x: 0, y: -1});
    this.topSprite = this.parent.pushGO(new Sprite({
      ...params,
      position: topGPos,
      zIndex: getZIndex(topGPos, -1),
      image: "brick_super_top"
    }));
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? [{
      mask: 16,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
  resolveCollision(mask) {
    if (mask & 16) {
      this.isOn = false;
      this.image = this.images[+this.isOn];
      this.topSprite.isActive = false;
    }
  }
}
//# sourceMappingURL=bricksuper.js.map
