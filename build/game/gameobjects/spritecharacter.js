import GameObject from "../../engine/gameobjects/gameobject.js";
import {floor, getZIndex, GMULTY, OPPOSITE_DIRS} from "../../engine/utilities/math.js";
export default class SpriteCharacter extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.images = [];
    this.animWidth = 0;
    this.animHeight = 0;
    this.animTrack = 0;
    this.timer = 0;
    this.direction = 1;
    this.order = params.order;
    this.width = params.width;
    this.speed = params.speed ?? 1;
    OPPOSITE_DIRS.forEach((d) => {
      const index = Math.max(d, 0);
      this.images[d] = {
        image: this.engine.library.getImage(params.images[index].name, params.images[index].extension),
        offset: params.images[index].offset
      };
    });
    this.animFrames = params.animFrames;
    this.animCount = params.animCount;
    this.setZIndex();
  }
  init(ctx) {
    this.animWidth = this.images[1].image.width / this.animFrames;
    this.animHeight = this.images[1].image.height;
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
    const width = this.width ?? 0;
    const image = this.images[this.direction];
    ctx.translate(-this.spos.x, 0);
    ctx.drawImage(image.image, width * this.order + image.offset + floor((this.animTrack + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * this.animWidth * this.animFrames / this.animCount, this.animWidth), 0, width, this.animHeight, width * (this.order - 1), GMULTY - this.animHeight, width, this.animHeight);
  }
}
//# sourceMappingURL=spritecharacter.js.map
