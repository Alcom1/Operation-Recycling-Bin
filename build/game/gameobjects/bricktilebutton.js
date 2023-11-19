import {MASKS} from "../../engine/utilities/math.js";
import BrickTile from "./bricktile.js";
const brickButtonOverride = Object.freeze({
  images: ["brick_button_off", "brick_button_on"],
  width: 2
});
export default class BrickTileButton extends BrickTile {
  constructor(params) {
    super(Object.assign(params, brickButtonOverride));
    this.plates = [];
    this.isLock = false;
  }
  init() {
    this.plates = this.engine.tag.get("BrickTile", "Level").filter((p) => p.circuit == this.circuit);
  }
  getColliders() {
    return super.getColliders().concat([{
      mask: MASKS.press,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }]);
  }
  resolveCollisions(collisions) {
    super.resolveCollisions(collisions);
    if (collisions.length == 0) {
      this.isLock = false;
    }
  }
  resolveCollision(mask) {
    if (mask & MASKS.press) {
      if (!this.isLock) {
        this.setOnOff(!this.isOn);
        this.plates.forEach((p) => p.setOnOff(this.isOn));
        this.isLock = true;
      }
    }
  }
}
//# sourceMappingURL=bricktilebutton.js.map
