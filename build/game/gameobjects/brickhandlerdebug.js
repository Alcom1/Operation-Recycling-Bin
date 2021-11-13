import {GMULTX, GMULTY} from "../../engine/utilities/math.js";
import BrickHandler from "./brickhandler.js";
export default class BrickHandlerDebug extends BrickHandler {
  constructor(params) {
    super(params);
    this.debugPoints = [];
    this.tags.push("BrickHandler");
  }
  update(dt) {
    this.debugPoints.forEach((dp) => dp.opacity -= dt * 2);
    this.debugPoints = this.debugPoints.filter((dp) => dp.opacity > 0);
  }
  draw(ctx) {
    ctx.fillStyle = "#0FF";
    this.debugPoints.forEach((dp) => {
      ctx.globalAlpha = dp.opacity;
      ctx.fillRect(GMULTX * dp.x + 4, GMULTY * dp.y + 4, GMULTX - 8, GMULTY - 8);
    });
  }
  checkCollisionRange(pos, dir, start, final, height, width = 2) {
    for (let i = start; i < final; i++) {
      this.debugPoints.push({
        x: pos.x + Math.floor(i / height) % width * dir,
        y: pos.y + i % height + 1,
        opacity: 1
      });
    }
    return super.checkCollisionRange(pos, dir, start, final, height, width);
  }
}
//# sourceMappingURL=brickhandlerdebug.js.map
