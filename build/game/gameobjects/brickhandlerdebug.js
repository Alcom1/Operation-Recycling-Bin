import {col1D, GMULTX, GMULTY} from "../../engine/utilities/math.js";
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
  checkCollisionRing(pos, size, dir = 1, overhang = true) {
    let collisions = 0;
    let count = 0;
    let row = [];
    for (let j = pos.y; j < pos.y + size; j++) {
      row = this.bricks.filter((b) => b.gpos.y == j && !b.isSelected) || [];
      for (let i = pos.x; i < pos.x + size; i += j > pos.y && j < pos.y + size - 1 ? size - 1 : 1) {
        let check = dir > 0 ? i : 2 * pos.x - i + size - 1;
        this.debugPoints.push({x: check, y: j, opacity: 1});
        row.forEach((brick2) => {
          if (col1D(brick2.gpos.x - 1, brick2.gpos.x + brick2.width, check, check)) {
            collisions += 1 << count;
          }
        });
        count++;
      }
    }
    if (overhang) {
      let check = dir > 0 ? pos.x + size : pos.x - 1;
      this.debugPoints.push({x: check, y: pos.y + size - 1, opacity: 1});
      row.forEach((brick2) => {
        if (col1D(brick2.gpos.x - 1, brick2.gpos.x + brick2.width, check, check)) {
          collisions += 1 << count;
        }
      });
      count++;
    }
    return collisions;
  }
}
//# sourceMappingURL=brickhandlerdebug.js.map
