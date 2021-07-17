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
    this._cursorPosition = new Vect(0, 0);
    this.isActive = false;
  }
  set cursorPosition(value) {
    this._cursorPosition = value;
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
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 25;
    const offsetX = 9;
    const offsetA = GMULTX * this.box.x / 2 + offsetX;
    const pos = {
      x: -GMULTX * 1 + offsetX,
      y: -GMULTY * (this.box.y + 4.5) - 10
    };
    const size = {
      x: GMULTX * (this.box.x + 2),
      y: GMULTY * (this.box.y + 2)
    };
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + size.x, pos.y);
    ctx.lineTo(pos.x + size.x, pos.y + size.y);
    ctx.lineTo(offsetA + 20, pos.y + size.y);
    ctx.lineTo(offsetA, pos.y + size.y + 50);
    ctx.lineTo(offsetA - 20, pos.y + size.y);
    ctx.lineTo(pos.x, pos.y + size.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = "rgba(0, 0, 0, 0)";
    ctx.stroke();
  }
  setMinMax(min, max) {
    this.isActive = true;
    this.box = max.getSub(min);
    this.mobileOffset = this._cursorPosition.getSub({
      x: min.x * GMULTX,
      y: min.y * GMULTY
    });
  }
  snap(state) {
    this.isSnapped = state;
  }
}
//# sourceMappingURL=mobileindicator.js.map
