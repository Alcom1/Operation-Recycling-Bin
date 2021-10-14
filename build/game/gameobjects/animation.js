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
    this.isLoop = params.isLoop ?? true;
    this.isVert = params.isVert ?? false;
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
      if (this.isLoop && this.timer > 1 / this.speed) {
        this.timer -= 1 / this.speed;
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
    this.zIndex = getZIndex(this.gpos, this.getSliceModifier());
  }
  getSliceModifier() {
    if (this.sliceIndex == null) {
      return 40;
    } else if (this.sliceIndex < 1) {
      return 310;
    } else {
      return 29;
    }
  }
  setImageIndex(index) {
    this.imageIndex = index;
  }
  getAnimationOffset(checkVert) {
    if (checkVert == this.isVert) {
      const fullSize = this.isVert ? this.fullSize.y : this.fullSize.x;
      return floor((this.animsIndex + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * fullSize / this.animsCount, fullSize / this.frameCount);
    } else {
      return 0;
    }
  }
  draw(ctx) {
    const size = this.framesSize ?? 0;
    const image = this.images[this.imageIndex];
    const widthSlice = size * (this.sliceIndex ?? 0);
    const oppoSize = this.isVert ? this.fullSize.x : this.fullSize.y;
    debugger;
    ctx.drawImage(image.image, widthSlice + image.offsetX + this.getAnimationOffset(false), this.getAnimationOffset(true), this.isVert ? oppoSize : size, this.isVert ? size : oppoSize, widthSlice, this.isVert ? 0 : GMULTY - this.fullSize.y, this.isVert ? oppoSize : size, this.isVert ? size : oppoSize);
  }
}
//# sourceMappingURL=animation.js.map
