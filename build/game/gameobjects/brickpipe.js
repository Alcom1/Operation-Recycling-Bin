import BrickTile from "./bricktile.js";
import WaterDrop from "./waterdrop.js";
const brickPipeOverride = Object.freeze({
  images: ["brick_pipe", "brick_pipe"],
  width: 2
});
export default class BrickPipe extends BrickTile {
  constructor(params) {
    super(Object.assign(params, brickPipeOverride));
    this.rate = 2.5;
    this.minDelay = 1;
    this.timer = this.minDelay + Math.random() * (this.rate - this.minDelay);
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
