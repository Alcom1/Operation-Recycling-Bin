import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, Z_DEPTH} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Stud extends GameObject {
  constructor(params) {
    super(params);
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.isVisible = true;
    this.mobilePreviewSize = new Vect(0, 0);
    this.isMobileFlipped = false;
    this.tags = ["Stud"];
    this.color = colorTranslate(params.color);
    this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "").toLowerCase()}`);
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
  get zState() {
    return super.zState && this.isVisible;
  }
  get zSize() {
    return {x: 1, y: 0};
  }
  get zLayer() {
    return this.isSelected && !this.isSnapped ? 1 : 0;
  }
  draw(ctx) {
    if (this.isVisible) {
      ctx.globalAlpha = this.isSnapped ? 0.75 : this.isSelected ? 0.5 : this.isPressed ? 0.75 : 1;
      ctx.drawImage(this.image, Z_DEPTH - 13, 0);
    }
  }
  superDraw(ctx) {
    if (this.engine.mouse.getMouseType() == "mouse" || !this.isSelected || !MOBILE_PREVIEW_MAX.getLessOrEqual(this.mobilePreviewSize)) {
      return;
    }
    ctx.drawImage(this.image, Z_DEPTH - 13.5, -GMULTY * (this.isMobileFlipped ? -this.mobilePreviewSize.y - 3.2 : this.mobilePreviewSize.y + 3.5));
  }
  snap(state) {
    this.isSnapped = state;
  }
  press() {
    this.isPressed = true;
  }
  select() {
    this.isSelected = true;
  }
  deselect() {
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
  }
  flipMobile(isFlipped) {
    this.isMobileFlipped = isFlipped;
  }
}
//# sourceMappingURL=stud.js.map
