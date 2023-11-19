import GameObject from "../../engine/gameobjects/gameobject.js";
import {floor, GMULTY, zip} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Anim extends GameObject {
  constructor(params) {
    super(params);
    this.images = [];
    this.fullSize = {x: 0, y: 0};
    this.isVisible = true;
    this.timer = 0;
    this.imageIndex = 0;
    this.animsIndex = 0;
    this.speed = params.speed ?? 1;
    this.isLoop = params.isLoop ?? true;
    this.isVert = params.isVert ?? false;
    this.framesSize = params.framesSize;
    this.gposOffset = params.gposOffset ?? {x: 0, y: 0};
    this.frameCount = params.frameCount;
    this.animsCount = params.animsCount ?? 1;
    switch (params.images.length) {
      case 0:
        break;
      case 1:
        this.images[0] = this.getImage(params.images[0]);
        break;
      default:
        this.imageIndex = 1;
        params.images.forEach((x, i) => {
          this.images[zip(i)] = this.getImage(x);
        });
    }
  }
  get duration() {
    return 1 / this.speed;
  }
  get zState() {
    return super.zState && this.isVisible;
  }
  get zSize() {
    return new Vect(super.zSize.x, 0);
  }
  getImage(params) {
    var image = this.engine.library.getImage(params.name, params.extension);
    image.offsetX = params.offsetX ?? 0;
    return image;
  }
  init(ctx) {
    this.fullSize = {
      x: this.images[this.imageIndex].width,
      y: this.images[this.imageIndex].height
    };
    if (!this.framesSize) {
      this.framesSize = (this.isVert ? this.fullSize.y : this.fullSize.x) / this.frameCount;
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
  reset(gpos, isTimerReset = true) {
    if (gpos) {
      this.gpos = gpos.getAdd(this.gposOffset);
    }
    if (isTimerReset) {
      this.timer = 0;
      this.animsIndex = ++this.animsIndex % this.animsCount;
    }
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
    const oppoSize = this.isVert ? this.fullSize.x : this.fullSize.y;
    ctx.drawImage(image, image.offsetX + this.getAnimationOffset(false), this.getAnimationOffset(true), this.isVert ? oppoSize : size, this.isVert ? size : oppoSize, 0, this.isVert ? 0 : GMULTY - this.fullSize.y, this.isVert ? oppoSize : size, this.isVert ? size : oppoSize);
  }
  getAnimationOffset(isVert) {
    if (isVert == this.isVert) {
      const fullSize = this.isVert ? this.fullSize.y : this.fullSize.x;
      return floor((this.animsIndex + Math.min(this.timer * this.speed, 1 - Number.EPSILON)) * fullSize / this.animsCount, fullSize / this.frameCount);
    } else {
      return 0;
    }
  }
}
//# sourceMappingURL=anim.js.map
