import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, UNDER_CURSOR_Z_INDEX, getZIndex, MOBILE_PREVIEW_MAX} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
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
    this.pressure = 0;
    this.minCarry = new Vect(0, 0);
    this.maxCarry = new Vect(0, 0);
    this.mobilePreviewSize = new Vect(0, 0);
    this.isMobileFlipped = false;
    this.color = colorTranslate(params.color);
    this.isGrey = !params.color;
    this.tags.push("Brick");
    this.width = params.width || 1;
    this.zIndex = getZIndex(this.gpos, this.width * 10);
  }
  update(dt) {
    if (this.isSelected) {
      this.setToCursor();
    }
  }
  draw(ctx) {
    ctx.globalAlpha = this.isSnapped ? 0.75 : this.isSelected ? 0.4 : this.isPressed ? 0.75 : 1;
    ctx.drawImage(this.image, 0, -Z_DEPTH - 3);
  }
  superDraw(ctx) {
    if (this.engine.mouse.getMouseType() == "mouse" || !this.isSelected || !MOBILE_PREVIEW_MAX.getLessOrEqual(this.mobilePreviewSize)) {
      return;
    }
    ctx.drawImage(this.image, 0, -Z_DEPTH - 3 - GMULTY * (this.isMobileFlipped ? -this.mobilePreviewSize.y - 3.2 : this.mobilePreviewSize.y + 3.5));
  }
  press() {
    if (!this.isStatic) {
      this.isPressed = true;
    }
  }
  select(pos) {
    this.isSelected = true;
    this.isChecked = true;
    this.selectedPos.set(pos);
    this.zIndex = UNDER_CURSOR_Z_INDEX;
  }
  deselect() {
    if (this.isSelected) {
      this.gpos.set(this.gpos.x + Math.round(this.spos.x / GMULTX), this.gpos.y + Math.round(this.spos.y / GMULTY));
    }
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.isChecked = false;
    this.spos.set(0, 0);
    this.selectedPos.set(0, 0);
    this.zIndex = getZIndex(this.gpos, this.width * 10);
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
  }
  snap(state) {
    if (state) {
      this.isSnapped = true;
      this.zIndex = getZIndex(this.gpos.getAdd({
        x: Math.round(this.spos.x / GMULTX),
        y: Math.round(this.spos.y / GMULTY)
      }), this.width * 10);
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
  setMinMax(min, max) {
    this.minCarry = min;
    this.maxCarry = max;
    this.mobilePreviewSize = max.getSub(min);
  }
  flipMobile(isFlipped) {
    this.isMobileFlipped = isFlipped;
  }
}
//# sourceMappingURL=brick.js.map
