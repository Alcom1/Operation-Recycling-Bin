import {MASKS} from "../../engine/utilities/math.js";
import BrickPlateTop from "./brickplatetop.js";
const brickSuperOverride = Object.freeze({
  images: ["brick_super_off", "brick_super"],
  imageTop: "brick_super_top"
});
export default class BrickSuper extends BrickPlateTop {
  constructor(params) {
    super(Object.assign(params, brickSuperOverride));
  }
  getColliders() {
    return super.getColliders().concat(this.isOn && !this.isSelected ? [{
      mask: MASKS.super,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
  resolveCollision(mask) {
    if (mask & MASKS.super) {
      this.setOnOff(false);
    }
  }
}
//# sourceMappingURL=bricksuper.js.map
