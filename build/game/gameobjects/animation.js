import GameObject from "../../engine/gameobjects/gameobject.js";
import {floor, getZIndex, GMULTY, OPPOSITE_DIRS} from "../../engine/utilities/math.js";
export default class Animat extends GameObject {
  constructor(params) {
    super(params);
    this.images = [];
    this.fullSize = {x: 0, y: 0};
    this.zModifierPub = 0;
    this.isVisible = true;
    this.timer = 0;
    this.imageIndex = 0;
    this.animsIndex = 0;
    this.speed = params.speed ?? 1;
    this.isLoop = params.isLoop ?? true;
    this.isVert = params.isVert ?? false;
    this.framesSize = params.framesSize;
    this.gposOffset = params.gposOffset ?? {x: 0, y: 0};
    this.zModifier = params.zModifier ?? 300;
    switch (params.images.length) {
      case 0:
        break;
      case 1:
        this.images[0] = this.getImage(params.images[0]);
        break;
      case 2:
        this.imageIndex = 1;
        OPPOSITE_DIRS.forEach((d) => {
          const index = Math.max(d, 0);
          if (params.images[index]) {
            this.images[d] = this.getImage(params.images[index]);
          }
        });
        break;
      default:
        this.imageIndex = 1;
        params.images.forEach((x, i) => {
          this.images[OPPOSITE_DIRS[i % 2] * Math.ceil((i + 1) / 2)] = this.getImage(x);
        });
    }
    this.frameCount = params.frameCount;
    this.animsCount = params.animsCount ?? 1;
    this.sliceIndex = params.sliceIndex;
  }
  get duration() {
    return 1 / this.speed;
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
    if (!this.framesSize) {
      this.framesSize = (this.isVert ? this.fullSize.y : this.fullSize.x) * this.animsCount / this.frameCount;
    }
  }
  update(dt) {
    if (this.speed > 0) {
      this.timer += dt;
      if (this.isLoop && this.timer > 1 / this.speed) {
        this.timer -= 1 / this.speed;
      }
    }
  }
  reset(gpos) {
    this.timer = 0;
    if (gpos) {
      this.gpos = gpos.getAdd(this.gposOffset);
    }
    this.animsIndex = ++this.animsIndex % this.animsCount;
  }
  getGOZIndex() {
    return getZIndex(this.gpos, this.zModifier + this.zModifierPub);
  }
  setImageIndex(index) {
    if (this.images[index]) {
      this.imageIndex = index;
    } else if (this.images[Math.sign(index)]) {
      this.imageIndex = Math.sign(index);
    } else if (this.images[0]) {
      this.imageIndex = 0;
    }
  }
  draw(ctx) {
    if (!this.isVisible) {
      return;
    }
    const size = this.framesSize ?? 0;
    const image = this.images[this.imageIndex];
    const widthSlice = size * (this.sliceIndex ?? 0);
    const oppoSize = this.isVert ? this.fullSize.x : this.fullSize.y;
    ctx.drawImage(image.image, widthSlice + image.offsetX + this.getAnimationOffset(false), this.getAnimationOffset(true), this.isVert ? oppoSize : size, this.isVert ? size : oppoSize, widthSlice, this.isVert ? 0 : GMULTY - this.fullSize.y, this.isVert ? oppoSize : size, this.isVert ? size : oppoSize);
  }
  getAnimationOffset(checkVert) {
    if (checkVert == this.isVert) {
      const fullSize = this.isVert ? this.fullSize.y : this.fullSize.x;
      return floor((this.animsIndex + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * fullSize / this.animsCount, fullSize / this.frameCount);
    } else {
      return 0;
    }
  }
}
//# sourceMappingURL=animation.js.map
