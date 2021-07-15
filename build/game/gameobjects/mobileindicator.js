import GameObject from "../../engine/gameobjects/gameobject.js";
import {BOUNDARY, GMULTX, GMULTY, round} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class MobileIndicator extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.mobileOffset = new Vect(0, 0);
    this.isSnapped = false;
    this.minBox = new Vect(0, 0);
    this.box = new Vect(0, 0);
    this.isActive = false;
  }
  update(dt) {
    this.spos = this.engine.mouse.getPos().getSub(this.mobileOffset).getClamp({
      x: BOUNDARY.minx * GMULTX,
      y: BOUNDARY.miny * GMULTY
    }, {
      x: (BOUNDARY.maxx - this.box.x) * GMULTX,
      y: (BOUNDARY.maxy - this.box.y) * GMULTY
    });
    if (this.isSnapped) {
      this.spos.set({
        x: round(this.spos.x, GMULTX),
        y: round(this.spos.y, GMULTY)
      });
    }
  }
  draw(ctx) {
    if (this.engine.mouse.getMouseType() == "mouse") {
      return;
    }
    ctx.fillStyle = "#EEE";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-GMULTX * 1 + 8, -GMULTY * (this.box.y + 4.5) - 10, GMULTX * (this.box.x + 2), GMULTY * (this.box.y + 2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.translate(GMULTX * this.box.x / 2 + 5, 0);
    ctx.beginPath();
    ctx.moveTo(20, -101.5);
    ctx.lineTo(0, -50);
    ctx.lineTo(-20, -101.5);
    ctx.fill();
    ctx.stroke();
  }
  setMinMax(min, max, spos) {
    this.isActive = true;
    this.box = max.getSub(min);
    this.mobileOffset = spos.getSub({
      x: min.x * GMULTX,
      y: min.y * GMULTY
    });
  }
  snap(state) {
    this.isSnapped = state;
  }
}
//# sourceMappingURL=mobileindicator.js.map
