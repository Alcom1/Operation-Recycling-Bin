import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorAdd, colorMult, colorTranslate, GMULTX, GMULTY, STUD_HEIGHT, STUD_RADIUS, UNDER_CURSOR_Z_INDEX, Z_DEPTH} from "../../engine/utilities/math.js";
export default class BrickStud extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.image = new Image();
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.isVisible = true;
    this.color = colorTranslate(params.color);
    this.colorDark = colorMult(this.color, 0.625);
    this.colorBright = colorAdd(this.color, 48);
    this.isGrey = !params.color;
    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + 1;
    this.image.src = this.engine.baker.bake((ctx) => this.drawBrickStud(ctx), GMULTX * 2, Z_DEPTH * 2, "STUD." + this.color);
  }
  draw(ctx) {
    if (this.isVisible) {
      ctx.globalAlpha = this.isSnapped ? 0.75 : this.isSelected ? 0.5 : this.isPressed ? 0.75 : 1;
      ctx.drawImage(this.image, Z_DEPTH - 13.5, 0);
    }
  }
  snap(state) {
    if (state) {
      this.isSnapped = true;
      this.zIndex = (this.gpos.x + Math.round(this.spos.x / GMULTX)) * 2 - (this.gpos.y + Math.round(this.spos.y / GMULTY)) * 100 + 1;
    } else {
      this.isSnapped = false;
      this.zIndex = UNDER_CURSOR_Z_INDEX;
    }
  }
  press() {
    this.isPressed = true;
  }
  select() {
    this.isSelected = true;
    this.zIndex = UNDER_CURSOR_Z_INDEX;
  }
  deselect() {
    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + 1;
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
  }
  drawBrickStud(ctx) {
    ctx.translate(12.5, GMULTY);
    for (let i = 1; i >= 0; i--) {
      const off = i * STUD_HEIGHT * 2;
      const gradient = ctx.createLinearGradient(off - STUD_RADIUS, 0, off + STUD_RADIUS, 0);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, this.colorDark);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(off, -STUD_HEIGHT - off, STUD_RADIUS, STUD_RADIUS * 0.36, 0, 0, Math.PI);
      ctx.ellipse(off, -STUD_HEIGHT * 2 - off, STUD_RADIUS, STUD_RADIUS * 0.36, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = this.colorBright;
      ctx.beginPath();
      ctx.ellipse(off, -STUD_HEIGHT * 2 - off, STUD_RADIUS, STUD_RADIUS * 0.36, 0, 0, 2 * Math.PI);
      ctx.fill();
      if (this.isGrey) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(off, -STUD_HEIGHT * 2 - off, STUD_RADIUS * 0.6, STUD_RADIUS * 0.216, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}
//# sourceMappingURL=brickstud.js.map
