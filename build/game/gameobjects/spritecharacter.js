import GameObject from "../../engine/gameobjects/gameobject.js";
import {floor, getZIndex, GMULTX, GMULTY} from "../../engine/utilities/math.js";
export default class SpriteCharacter extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.animWidth = 0;
    this.animHeight = 0;
    this.animTrack = 0;
    this.timer = 0;
    this.direction = 1;
    this.order = params.order;
    this.speed = params.speed ?? 1;
    this.imageRight = {
      image: this.engine.library.getImage(params.imageRight.name, params.imageRight.extension),
      offset: params.imageRight.offset
    };
    this.imageLeft = {
      image: this.engine.library.getImage(params.imageLeft.name, params.imageLeft.extension),
      offset: params.imageLeft.offset
    };
    this.animFrames = params.animFrames;
    this.animCount = params.animCount;
    this.setZIndex();
  }
  init(ctx) {
    this.animWidth = this.imageRight.image.width / this.animFrames;
    this.animHeight = this.imageRight.image.height;
  }
  update(dt) {
    this.timer += dt;
  }
  updateSprite(gpos) {
    this.timer = 0;
    this.gpos = gpos;
    this.animTrack = ++this.animTrack % this.animCount;
    this.setZIndex();
  }
  setZIndex() {
    this.zIndex = getZIndex(this.gpos, 300 - (this.order < 2 ? 0 : 295));
  }
  draw(ctx) {
    ctx.translate(-this.spos.x, 0);
    ctx.drawImage(this.direction > 0 ? this.imageRight.image : this.imageLeft.image, GMULTX * this.order + (this.direction > 0 ? this.imageRight.offset : this.imageLeft.offset) + floor((this.animTrack + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * this.animWidth * this.animFrames / this.animCount, this.animWidth), 0, GMULTX, this.animHeight, GMULTX * (this.order - 1), GMULTY - this.animHeight, GMULTX, this.animHeight);
  }
}
//# sourceMappingURL=spritecharacter.js.map
