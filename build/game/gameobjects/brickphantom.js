import {GMULTX, GMULTY, Z_DEPTH} from "../../engine/utilities/math.js";
import Brick from "./brick.js";
export default class BrickPhantom extends Brick {
  constructor(params) {
    super({...params, block: true});
    this.tags.push("BrickPhantom");
  }
  draw(ctx) {
    if (this.isDebug) {
      ctx.fillStyle = "#0008";
      ctx.fillRect(4 + Z_DEPTH, 4 - Z_DEPTH, GMULTX * this.width - 8, GMULTY - 8);
    }
  }
}
//# sourceMappingURL=brickphantom.js.map
