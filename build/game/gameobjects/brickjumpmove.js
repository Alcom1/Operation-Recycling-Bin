import BrickJump from "./brickjump.js";
const brickJumpMoveOverride = Object.freeze({
  color: "yellow",
  images: ["brick_jump_move", "brick_jump_move"],
  width: 2,
  isOn: true
});
export default class BrickJumpMove extends BrickJump {
  constructor(params) {
    super(Object.assign(params, brickJumpMoveOverride));
  }
}
//# sourceMappingURL=brickjumpmove.js.map
