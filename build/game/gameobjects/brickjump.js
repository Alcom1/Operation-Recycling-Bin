import BrickPlate from "./brickplate.js";
const brickJumpOverride = Object.freeze({
  images: ["brick_jump", "brick_jump"],
  width: 2,
  isOn: true
});
export default class BrickJump extends BrickPlate {
  constructor(params) {
    super(Object.assign({}, brickJumpOverride, params));
    this.timer = 0;
    this.offDuration = 1.5;
  }
  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
    } else {
      this.timer = 0;
      this.isOn = true;
    }
  }
  getColliders() {
    return super.getColliders().concat(this.isOn && !this.isSelected ? [{
      mask: 64,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
  resolveCollision(mask) {
    if (mask & 64) {
      this.isOn = false;
      this.timer = this.offDuration;
    }
  }
}
//# sourceMappingURL=brickjump.js.map
