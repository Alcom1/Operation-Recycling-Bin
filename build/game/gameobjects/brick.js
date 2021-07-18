import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, UNDER_CURSOR_Z_INDEX, getZIndex, MOBILE_PREVIEW_MAX} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import BrickStud from "./brickstud.js";
export default class Brick extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.engine = engine2;
    this.image = new Image();
    this.brickSprites = new Map();
    this.brickSpriteKeys = new Map([
      ["l", false],
      ["m", false],
      ["r", false],
      ["h", true]
    ]);
    this.isStatic = false;
    this.isPressed = false;
    this.isSelected = false;
    this.isSnapped = false;
    this.selectedPos = new Vect(0, 0);
    this.isGrounded = false;
    this.isChecked = false;
    this.pressure = 0;
    this.studs = [];
    this.minCarry = new Vect(0, 0);
    this.maxCarry = new Vect(0, 0);
    this.mobilePreviewSize = new Vect(0, 0);
    this.isMobileFlipped = false;
    this.color = colorTranslate(params.color);
    this.isGrey = !params.color;
    this.width = params.width || 1;
    this.zIndex = getZIndex(this.gpos, this.width * 10);
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
    this.brickSpriteKeys.forEach((needsGrey, spriteKey) => {
      if (!needsGrey || this.isGrey) {
        this.brickSprites.set(spriteKey, engine2.library.getImage(`brick_${spriteKey}_${this.color.replace("#", "").toLowerCase()}`));
      }
    });
  }
  init() {
    var imageName = `BRICK.${this.width}.${this.color}`;
    this.image = this.engine.library.getImageWithSrc(imageName, this.engine.baker.bake((ctx) => this.drawBrick(ctx), this.width * GMULTX + Z_DEPTH + 3, GMULTY + Z_DEPTH + 3, imageName));
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
    this.isChecked = false;
    this.spos.set(0, 0);
    this.selectedPos.set(0, 0);
    this.zIndex = getZIndex(this.gpos, this.width * 10);
    this.resetStuds();
    this.studs.forEach((s) => s.deselect());
  }
  snap(state) {
    this.studs.forEach((s) => s.snap(state));
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
  resetStuds() {
    for (const [idx, stud] of this.studs.entries()) {
      stud.gpos.set(this.gpos.x + idx, this.gpos.y - 1);
      stud.spos.set(this.spos);
    }
  }
  setMinMax(min, max) {
    this.minCarry = min;
    this.maxCarry = max;
    this.mobilePreviewSize = max.getSub(min);
    this.studs.forEach((s) => s.mobilePreviewSize = this.mobilePreviewSize);
  }
  flipMobile(isFlipped) {
    this.isMobileFlipped = isFlipped;
    this.studs.forEach((s) => s.flipMobile(isFlipped));
  }
  drawBrick(ctx) {
    ctx.save();
    ctx.drawImage(this.brickSprites.get("l"), 0, 0);
    ctx.translate(30, 0);
    for (let j = 1; j < this.width; j++) {
      ctx.drawImage(this.brickSprites.get("m"), 0, 0);
      ctx.translate(30, 0);
    }
    ctx.drawImage(this.brickSprites.get("r"), 0, 0);
    ctx.restore();
    if (this.isGrey) {
      for (let j = 1; j < this.width; j++) {
        ctx.drawImage(this.brickSprites.get("h"), 30 * (j - 1), 0);
      }
    }
  }
}
//# sourceMappingURL=brick.js.map
