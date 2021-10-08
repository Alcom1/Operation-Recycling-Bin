import {col1D, GMULTX, GMULTY, Z_DEPTH} from "../../engine/utilities/math.js";
import BrickBase from "./brickbase.js";
import BrickStud from "./brickstud.js";
export default class Brick extends BrickBase {
  constructor(engine2, params) {
    super(engine2, params);
    this.studs = [];
    this.brickSprites = new Map();
    this.brickSpriteKeys = new Map([
      ["l", false],
      ["m", false],
      ["r", false],
      ["h", true]
    ]);
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
  press() {
    super.press();
    if (!this.isStatic) {
      this.studs.forEach((s) => s.press());
    }
  }
  select(pos) {
    super.select(pos);
    this.studs.forEach((s) => s.select());
  }
  deselect() {
    super.deselect();
    this.resetStuds();
  }
  setToCursor() {
    super.setToCursor();
    this.resetStuds();
  }
  snap(state) {
    super.snap(state);
    this.studs.forEach((s) => s.snap(state));
  }
  hideStuds(rowBricks) {
    this.studs.forEach((s) => {
      s.isVisible = true;
      for (const brick of rowBricks) {
        if (!brick.isSelected && !brick.isPressed && col1D(brick.gpos.x - 1, brick.gpos.x + brick.width, s.gpos.x, s.gpos.x)) {
          s.isVisible = false;
          break;
        }
      }
    });
  }
  showStuds() {
    this.studs.forEach((s) => s.isVisible = true);
  }
  resetStuds() {
    for (const [idx, stud] of this.studs.entries()) {
      stud.gpos.set(this.gpos.x + idx, this.gpos.y - 1);
      stud.spos.set(this.spos);
      stud.deselect();
    }
  }
  setMinMax(min, max) {
    super.setMinMax(min, max);
    this.studs.forEach((s) => s.mobilePreviewSize = this.mobilePreviewSize);
  }
  flipMobile(isFlipped) {
    super.flipMobile(isFlipped);
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
