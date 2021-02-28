import GameObject from "../../engine/gameobjects/gameobject.js";
export default class Sprite extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.image = new Image();
    this.image.src = `/assets/img/${params.image}.${params.extention ?? "png"}`;
  }
  draw(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
}
//# sourceMappingURL=sprite.js.map
