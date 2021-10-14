import GameObject from "../../engine/gameobjects/gameobject.js";
import {floor, getZIndex, GMULTY, OPPOSITE_DIRS} from "../../engine/utilities/math.js";
export default class Animat extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.images = [];
    this.fullSize = {x: 0, y: 0};
    this.timer = 0;
    this.imageIndex = 0;
    this.animsIndex = 0;
    this.speed = params.speed ?? 1;
    this.loop = params.loop ?? true;
    this.framesSize = params.framesSize;
    this.gposOffset = params.gposOffset ?? {x: 0, y: 0};
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
    this.animsCount = params.animsCount ?? 1;
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
      x: this.images[this.imageIndex].image.width,
      y: this.images[this.imageIndex].image.height
    };
  }
  update(dt) {
    if (this.speed > 0) {
      this.timer += dt;
      if (this.loop && this.timer > 1 / this.speed) {
        this.timer = 0;
      }
    }
  }
  updateSprite(gpos) {
    this.timer = 0;
    this.gpos = gpos.getAdd(this.gposOffset);
    this.animsIndex = ++this.animsIndex % this.animsCount;
    this.setZIndex();
  }
  setZIndex() {
    this.zIndex = getZIndex(this.gpos, 310 - ((this.sliceIndex ?? 1) < 1 ? 0 : 270));
  }
  setImageIndex(index) {
    this.imageIndex = index;
  }
  draw(ctx) {
    const width = this.framesSize ?? 0;
    const image = this.images[this.imageIndex];
    const widthSlice = width * (this.sliceIndex ?? 0);
    ctx.drawImage(image.image, widthSlice + image.offsetX + floor((this.animsIndex + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * this.fullSize.x / this.animsCount, this.fullSize.x / this.frameCount), 0, width, this.fullSize.y, widthSlice, GMULTY - this.fullSize.y, width, this.fullSize.y);
  }
}
//# sourceMappingURL=animation.js.map
