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
}
//# sourceMappingURL=brickjump.js.map
