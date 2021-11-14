import BrickPlateTop from "./brickplatetop.js";
const brickJumpOverride = Object.freeze({
  images: ["brick_jump_up", "brick_jump"],
  imageTop: "brick_jump_top",
  isOnTop: false,
  width: 2,
  isOn: true
});
export default class BrickJump extends BrickPlateTop {
  constructor(params) {
    super(Object.assign({}, brickJumpOverride, params));
    this.timer = 0;
    this.offDuration = 0.1;
    this.timer2 = 0;
    this.offDuration2 = 1.2;
  }
  update(dt) {
    if (this.timer2 > 0) {
      this.timer2 -= dt;
    } else {
      this.timer2 = 0;
    }
    if (this.timer > 0) {
      this.timer -= dt;
    } else {
      this.timer = 0;
      this.setOnOff(true);
    }
  }
  getColliders() {
    return super.getColliders().concat(this.isOn && this.timer2 == 0 && !this.isSelected ? [{
      mask: 64,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
  resolveCollision(mask) {
    if (mask & 64) {
      this.setOnOff(false);
      this.timer = this.offDuration;
      this.timer2 = this.offDuration2;
    }
  }
}
//# sourceMappingURL=brickjump.js.map
