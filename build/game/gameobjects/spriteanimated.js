import GameObject from "../../engine/gameobjects/gameobject.js";
import {floor, getZIndex, GMULTY, OPPOSITE_DIRS} from "../../engine/utilities/math.js";
export default class SpriteAnimated extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.images = [];
    this.fullSize = {x: 0, y: 0};
    this.timer = 0;
    this.imageIndex = 0;
    this.animsIndex = 0;
    this.speed = params.speed ?? 1;
    this.frameWidth = params.frameWidth;
    switch (params.images.length) {
      case 0:
        break;
      case 1:
        this.images[0] = this.getImage(params.images[0]);
      case 2:
        this.imageIndex = 1;
        OPPOSITE_DIRS.forEach((d) => {
          const index = Math.max(d, 0);
          if (params.images[index]) {
            this.images[d] = this.getImage(params.images[index]);
          }
        });
      default:
        params.images.forEach((i) => this.images.push(this.getImage(i)));
    }
    this.frameCount = params.frameCount;
    this.animsCount = params.animsCount;
    this.sliceIndex = params.sliceIndex;
    this.setZIndex();
  }
  getImage(params) {
    return {
      image: this.engine.library.getImage(params.name, params.extension),
      offsetX: params.offsetX ?? 0
    };
  }
  init(ctx) {
    this.fullSize = {
      x: this.images[this.imageIndex].image.width / this.frameCount,
      y: this.images[this.imageIndex].image.height
    };
  }
  update(dt) {
    this.timer += dt;
  }
  updateSprite(gpos) {
    this.timer = 0;
    this.gpos = gpos;
    this.animsIndex = ++this.animsIndex % this.animsCount;
    this.setZIndex();
  }
  setZIndex() {
    this.zIndex = getZIndex(this.gpos, 310 - (this.sliceIndex < 2 ? 0 : 295));
  }
  setImageIndex(index) {
    this.imageIndex = index;
  }
  draw(ctx) {
    const width = this.frameWidth ?? 0;
    const image = this.images[this.imageIndex];
    ctx.drawImage(image.image, width * this.sliceIndex + image.offsetX + floor((this.animsIndex + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * this.fullSize.x * this.frameCount / this.animsCount, this.fullSize.x), 0, width, this.fullSize.y, width * this.sliceIndex, GMULTY - this.fullSize.y, width, this.fullSize.y);
  }
}
//# sourceMappingURL=spriteanimated.js.map
