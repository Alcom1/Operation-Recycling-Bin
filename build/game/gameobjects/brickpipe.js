import BrickPlate from "./brickplate.js";
import WaterDrop from "./waterdrop.js";
const brickPipeOverride = Object.freeze({
  images: ["brick_pipe", "brick_pipe"],
  width: 2
});
export default class BrickPipe extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickPipeOverride));
    this.rate = 2.5;
    this.antiDelay = 1;
    this.timer = this.antiDelay + Math.random() * (this.rate - this.antiDelay);
    this.drop = this.parent.pushGO(new WaterDrop(params));
  }
  update(dt) {
    this.timer += dt;
    if (this.timer > this.rate) {
      this.timer = 0;
      this.drop.reset(this.gpos);
    }
  }
}
//# sourceMappingURL=brickpipe.js.map
