import GameObject from "../../engine/gameobjects/gameobject.js";
import {BOUNDARY, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, round} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class MobileIndicator extends GameObject {
  constructor(params) {
    super(params);
    this.mobileOffset = new Vect(0, 0);
    this.isSnapped = false;
    this.isFlipped = false;
    this.minBox = new Vect(0, 0);
    this.box = new Vect(0, 0);
    this.bricks = [];
    this._cursorPosition = new Vect(0, 0);
    this.isActive = false;
  }
  set cursorPosition(value) {
    this._cursorPosition = value;
  }
  init(ctx) {
    this.bricks = this.engine.tag.get("Brick", "Level");
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
    this.isFlipped = this.spos.y < GMULTY * (this.box.y + 5);
    this.bricks.filter((b) => b.isSelected).forEach((b) => b.flipMobile(this.isFlipped));
  }
  draw(ctx) {
    if (this.engine.mouse.getMouseType() == "mouse" || !MOBILE_PREVIEW_MAX.getLessOrEqual(this.box)) {
      return;
    }
    ctx.translate(GMULTX * this.box.x / 2 + 10, GMULTY * this.box.y / 2 - 15);
    if (this.isFlipped) {
      ctx.rotate(Math.PI);
    }
    ctx.fillStyle = "#EEE";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 25;
    const pos = {
      x: -GMULTX * (this.box.x * 0.5 + 1),
      y: -GMULTY * (this.box.y * 1.5 + 4.5) + 5
    };
    const size = {
      x: GMULTX * (this.box.x + 2),
      y: GMULTY * (this.box.y + 2)
    };
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + size.x, pos.y);
    ctx.lineTo(pos.x + size.x, pos.y + size.y);
    ctx.lineTo(20, pos.y + size.y);
    ctx.lineTo(0, pos.y + size.y + 50);
    ctx.lineTo(-20, pos.y + size.y);
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
