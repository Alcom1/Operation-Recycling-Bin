import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, GMULTX, GMULTY, UNDER_CURSOR_Z_INDEX, Z_DEPTH} from "../../engine/utilities/math.js";
export default class BrickStud extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.isVisible = true;
    this.color = colorTranslate(params.color);
    this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + 1;
    this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "")}`);
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
}
//# sourceMappingURL=brickstud.js.map
