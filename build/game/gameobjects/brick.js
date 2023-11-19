import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, MOBILE_PREVIEW_MAX} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Brick extends GameObject {
  constructor(params) {
    super(params);
    this.image = new Image();
    this.isStatic = false;
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.selectedPos = new Vect(0, 0);
    this.isGrounded = false;
    this.isChecked = false;
    this.minCarry = new Vect(0, 0);
    this.maxCarry = new Vect(0, 0);
    this.mobilePreviewSize = new Vect(0, 0);
    this.isMobileFlipped = false;
    this._isBlock = false;
    this._isGlide = false;
    this.color = colorTranslate(params.color);
    this._isGrey = !params.color;
    this._isBlock = params.block ?? false;
    this._isGlide = params.glide ?? false;
    this.tags.push("Brick");
    this.width = params.width || 1;
  }
  get isGrey() {
    return this._isGrey;
  }
  get isBlock() {
    return this._isBlock;
  }
  get isGlide() {
    return this._isGlide;
  }
  get zIndex() {
    return super.zIndex;
  }
  set zIndex(value) {
    super.zIndex = value + (this.isSelected && !this.isSnapped ? 2e3 : 0);
  }
  get zpos() {
    return this.isSelected ? this.gpos.getAdd({
      x: Math.floor(this.spos.x / GMULTX),
      y: Math.floor(this.spos.y / GMULTY)
    }) : super.zpos;
  }
  get zSize() {
    return {x: this.width, y: 1};
  }
  get zLayer() {
    return this.isSelected && !this.isSnapped ? 1 : 0;
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
    this.isSnapped = state;
    if (!this.isSnapped) {
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
