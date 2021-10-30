import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, getZIndex, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, UNDER_CURSOR_Z_INDEX, Z_DEPTH} from "../../engine/utilities/math.js";
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
    this.color = colorTranslate(params.color);
    this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "").toLowerCase()}`);
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
  getGOZIndex() {
    if (this.isSnapped) {
      return getZIndex(this.gpos.getAdd({
        x: Math.round(this.spos.x / GMULTX),
        y: Math.round(this.spos.y / GMULTY)
      }), 1);
    }
    if (this.isSelected) {
      return UNDER_CURSOR_Z_INDEX;
    } else {
      return getZIndex(this.gpos, 1);
    }
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
