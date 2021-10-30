import ZGameObject from "./zgameobject.js";
export default class Sprite extends ZGameObject {
  constructor(params) {
    super(params);
    this.image = this.engine.library.getImage(params.image, params.extension);
  }
  draw(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
}
//# sourceMappingURL=sprite.js.map
