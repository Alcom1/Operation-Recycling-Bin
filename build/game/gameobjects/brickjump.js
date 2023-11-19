import {Faction, MASKS} from "../../engine/utilities/math.js";
import BrickTileTop from "./bricktiletop.js";
const brickJumpOverride = Object.freeze({
  images: ["brick_jump_up", "brick_jump"],
  imageTop: "brick_jump_top",
  isShowTopIfOn: false
});
export default class BrickJump extends BrickTileTop {
  constructor(params) {
    super(Object.assign({}, brickJumpOverride, params));
    this.timer = 0;
    this.timerDuration = 0.1;
    this.timer2 = 0;
    this.timer2Duration = 1.2;
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
  }
  update(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
    } else {
      this.timer = 0;
      this.setOnOff(true);
    }
    if (this.timer2 > 0) {
      this.timer2 -= dt;
    } else {
      this.timer2 = 0;
    }
  }
  isBlocked() {
    if (this.isGrey) {
      return false;
    }
    return !!this.brickHandler.checkCollisionRange(this.gpos.getAdd({
      x: 0,
      y: -2
    }), 1, 0, 2, 1, void 0, Faction.HOSTILE);
  }
  getColliders() {
    return super.getColliders().concat(this.isOn && this.timer2 == 0 && !this.isSelected && !this.isBlocked() ? [{
      mask: MASKS.jumps,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
  resolveCollision(mask) {
    if (mask & MASKS.jumps) {
      this.setOnOff(false);
      this.timer = this.timerDuration;
      this.timer2 = this.timer2Duration;
    }
  }
}
//# sourceMappingURL=brickjump.js.map
