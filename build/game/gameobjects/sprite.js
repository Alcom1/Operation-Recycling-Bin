import GameObject from "../../engine/gameobjects/gameobject.js";
export default class Sprite extends GameObject {
  get zSize() {
    return this.size ?? super.zSize;
  }
  constructor(params) {
    super(params);
    this.image = this.engine.library.getImage(params.image, params.extension);
    this.size = params.size;
  }
  draw(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
}
//# sourceMappingURL=sprite.js.map
