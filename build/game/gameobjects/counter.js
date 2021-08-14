import GameObject from "../../engine/gameobjects/gameobject.js";
import {GMULTX} from "../../engine/utilities/math.js";
export default class Counter extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.count = 0;
    this.fontFamily = "";
    this.par = 1;
    this.fontFamily = params.fontFamily ?? "Font04b_08";
  }
  init() {
    this.par = this.engine.tag.get("LevelSequence", "Level")[0].par;
  }
  incrementCount() {
    this.count++;
  }
  draw(ctx) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#DD9C00";
    ctx.font = "32px " + this.fontFamily;
    ctx.fillText("" + this.count, GMULTX * 35 + 200, 450);
    ctx.fillStyle = "#000";
    ctx.font = "16px " + this.fontFamily;
    ctx.fillText(this.par + " or fewer", GMULTX * 35 + 203.5, 484);
    if (this.par >= this.count) {
      ctx.fillStyle = "#FFCC00";
      ctx.fillRect(GMULTX * 35 + 56, 472, 12, 12);
    }
  }
}
//# sourceMappingURL=counter.js.map
