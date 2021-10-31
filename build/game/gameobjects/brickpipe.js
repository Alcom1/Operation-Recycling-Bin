import BrickPlate from "./brickplate.js";
const brickPipeOverride = Object.freeze({
  images: ["brick_pipe", "brick_pipe"],
  width: 2,
  isOn: true
});
export default class BrickPipe extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickPipeOverride));
  }
}
//# sourceMappingURL=brickpipe.js.map
