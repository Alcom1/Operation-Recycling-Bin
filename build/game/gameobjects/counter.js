import GameObject from "../../engine/gameobjects/gameobject.js";
import {GMULTX} from "../../engine/utilities/math.js";
export default class Counter extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.count = 0;
    this.font = "";
    this.font = params.font ?? "32px FiveByFive";
  }
  incrementCount() {
    this.count++;
  }
  draw(ctx) {
    ctx.textAlign = "right";
    ctx.font = this.font;
    ctx.fillStyle = "#DD9C00";
    ctx.fillText("" + this.count, GMULTX * 35 + 200, 450);
  }
}
//# sourceMappingURL=counter.js.map
