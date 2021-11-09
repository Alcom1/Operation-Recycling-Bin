import BrickPlate from "./brickplate.js";
const brickJumpOverride = Object.freeze({
  images: ["brick_jump", "brick_jump"],
  width: 2,
  isOn: true
});
export default class BrickJump extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickJumpOverride));
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? [{
      mask: 64,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
}
//# sourceMappingURL=brickjump.js.map
