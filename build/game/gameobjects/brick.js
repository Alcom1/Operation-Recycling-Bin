import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, colorMult, colorAdd, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, UNDER_CURSOR_Z_INDEX, LINE_WIDTH, STUD_RADIUS} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import BrickStud from "./brickstud.js";
export default class Brick extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.engine = engine2;
    this.image = new Image();
    this.isStatic = false;
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.selectedPos = new Vect(0, 0);
    this.isGrounded = false;
    this.isChecked = false;
    this.studs = [];
    this.minCarry = new Vect(0, 0);
    this.maxCarry = new Vect(0, 0);
    this.color = colorTranslate(params.color);
    this.colorDark = colorMult(this.color, 0.625);
    this.colorBright = colorAdd(this.color, 48);
    this.isGrey = !params.color;
    this.width = params.width || 1;
    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + this.width * 2;
    for (let i = 0; i < this.width; i++) {
      const stud = new BrickStud(this.engine, {
        ...params,
        position: {
          x: this.gpos.x + i,
          y: this.gpos.y - 1
        }
      });
      this.studs.push(stud);
      this.parent.pushGO(stud);
    }
    this.image.src = this.engine.baker.bake((ctx) => this.drawBrick(ctx), this.width * GMULTX + Z_DEPTH + 3, GMULTY + Z_DEPTH + 3, `BRICK.${this.width}.${this.color}`);
  }
  update(dt) {
    if (this.isSelected) {
      this.setToCursor();
    }
  }
  draw(ctx) {
    ctx.globalAlpha = this.isSnapped ? 0.75 : this.isSelected ? 0.5 : this.isPressed ? 0.75 : 1;
    ctx.drawImage(this.image, 0, -Z_DEPTH - 3);
  }
  setToCursor() {
    this.spos = this.engine.mouse.getPos().getSub(this.selectedPos).getClamp({
      x: (BOUNDARY.minx - this.minCarry.x) * GMULTX,
      y: (BOUNDARY.miny - this.minCarry.y) * GMULTY
    }, {
      x: (BOUNDARY.maxx - this.maxCarry.x) * GMULTX,
      y: (BOUNDARY.maxy - this.maxCarry.y) * GMULTY
    });
    if (this.isSnapped) {
      this.spos.set({
        x: round(this.spos.x, GMULTX),
        y: round(this.spos.y, GMULTY)
      });
    }
    this.resetStuds();
  }
  press() {
    if (!this.isStatic) {
      this.isPressed = true;
      this.studs.forEach((s) => s.press());
    }
  }
  select(pos) {
    this.isSelected = true;
    this.isChecked = true;
    this.selectedPos.set(pos);
    this.zIndex = UNDER_CURSOR_Z_INDEX;
    this.studs.forEach((s) => s.select());
  }
  deselect() {
    if (this.isSelected) {
      this.gpos.set(this.gpos.x + Math.round(this.spos.x / GMULTX), this.gpos.y + Math.round(this.spos.y / GMULTY));
    }
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.spos.set(0, 0);
    this.selectedPos.set(0, 0);
    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + this.width * 2;
    this.resetStuds();
    this.studs.forEach((s) => s.deselect());
  }
  snap(state) {
    this.studs.forEach((s) => s.snap(state));
    if (state) {
      this.isSnapped = true;
      this.zIndex = (this.gpos.x + Math.round(this.spos.x / GMULTX)) * 2 - (this.gpos.y + Math.round(this.spos.y / GMULTY)) * 100 + this.width * 2;
    } else {
      this.isSnapped = false;
      this.zIndex = UNDER_CURSOR_Z_INDEX;
      this.setToCursor();
    }
  }
  clearRecursion() {
    this.isGrounded = false;
    this.isChecked = false;
  }
  resetStuds() {
    for (const [idx, stud] of this.studs.entries()) {
      stud.gpos.set(this.gpos.x + idx, this.gpos.y - 1);
      stud.spos.set(this.spos);
    }
  }
  setMinMax(min, max) {
    this.minCarry = min;
    this.maxCarry = max;
  }
  drawBrick(ctx) {
    ctx.translate(0, Z_DEPTH + 3);
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.width * GMULTX, GMULTY);
    ctx.fillStyle = this.colorDark;
    ctx.beginPath();
    ctx.moveTo(this.width * GMULTX, GMULTY);
    ctx.lineTo(this.width * GMULTX, 0);
    ctx.lineTo(this.width * GMULTX + Z_DEPTH, -Z_DEPTH);
    ctx.lineTo(this.width * GMULTX + Z_DEPTH, GMULTY - Z_DEPTH);
    ctx.fill();
    ctx.fillStyle = this.colorBright;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Z_DEPTH, -Z_DEPTH);
    ctx.lineTo(this.width * GMULTX + Z_DEPTH, -Z_DEPTH);
    ctx.lineTo(this.width * GMULTX, 0);
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(Z_DEPTH, -Z_DEPTH);
    ctx.lineTo(LINE_WIDTH / 2, 0);
    ctx.stroke();
    ctx.strokeStyle = this.colorDark;
    ctx.beginPath();
    ctx.moveTo(LINE_WIDTH / 2, LINE_WIDTH / 2);
    ctx.lineTo(LINE_WIDTH / 2, GMULTY - LINE_WIDTH / 2);
    ctx.lineTo(this.width * GMULTX, GMULTY - LINE_WIDTH / 2);
    ctx.stroke();
    if (this.isGrey) {
      const yoff = Math.ceil(GMULTY * 0.4);
      ctx.fillStyle = this.colorDark;
      for (let j = 1; j < this.width; j++) {
        const xoff = GMULTX * j;
        ctx.beginPath();
        ctx.arc(xoff, yoff, STUD_RADIUS, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xoff, yoff, STUD_RADIUS * 0.64, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}
//# sourceMappingURL=brick.js.map
