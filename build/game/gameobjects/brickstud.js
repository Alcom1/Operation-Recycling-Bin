import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, getZIndex, GMULTX, GMULTY, UNDER_CURSOR_Z_INDEX, Z_DEPTH} from "../../engine/utilities/math.js";
export default class BrickStud extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.isVisible = true;
    this.mobileOffset = 0;
    this.color = colorTranslate(params.color);
    this.zIndex = getZIndex(this.gpos, 1);
    this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "").toLowerCase()}`);
  }
  draw(ctx) {
    if (this.isVisible) {
      ctx.globalAlpha = this.isSnapped ? 0.75 : this.isSelected ? 0.5 : this.isPressed ? 0.75 : 1;
      ctx.drawImage(this.image, Z_DEPTH - 13.5, 0);
      if (this.isSelected && this.mobileOffset > 0 && this.engine.mouse.getMouseType() != "mouse") {
        ctx.globalAlpha = this.isSnapped ? 0.75 : 0.25;
        ctx.drawImage(this.image, Z_DEPTH - 13.5, -GMULTY * this.mobileOffset);
      }
    }
  }
  superDraw(ctx) {
    if (this.isSelected && this.mobileOffset > 0 && this.engine.mouse.getMouseType() != "mouse") {
      ctx.drawImage(this.image, Z_DEPTH - 13.5, -GMULTY * this.mobileOffset);
    }
  }
  snap(state) {
    if (state) {
      this.isSnapped = true;
      this.zIndex = getZIndex(this.gpos.getAdd({
        x: Math.round(this.spos.x / GMULTX),
        y: Math.round(this.spos.y / GMULTY)
      }), 1);
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
    this.zIndex = getZIndex(this.gpos, 1);
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
  }
}
//# sourceMappingURL=brickstud.js.map
