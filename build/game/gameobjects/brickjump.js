import BrickPlateTop from "./brickplatetop.js";
const brickJumpOverride = Object.freeze({
  images: ["brick_jump_up", "brick_jump"],
  imageTop: "brick_jump_top",
  isOnTop: false,
  isOn: true
});
export default class BrickJump extends BrickPlateTop {
  constructor(params) {
    super(Object.assign({}, brickJumpOverride, params));
    this.timer = 0;
    this.offDuration = 1;
    this.timer2 = 0;
    this.offDuration2 = 1.2;
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
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
  isBlocked() {
    if (this.isGrey) {
      return false;
    }
    return !!this.brickHandler.checkCollisionRange(this.gpos.getAdd({
      x: 0,
      y: -2
    }), 1, 0, 2, 1);
  }
  getColliders() {
    return super.getColliders().concat(this.isOn && this.timer2 == 0 && !this.isSelected && !this.isBlocked() ? [{
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
