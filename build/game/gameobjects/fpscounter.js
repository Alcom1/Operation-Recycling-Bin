import GameObject from "../../engine/gameobjects/gameobject.js";
export default class FPSCounter extends GameObject {
  constructor(params) {
    super(params);
    this.text = "";
    this.font = params.font ?? "18pt Consolas";
    this.color = params.color || "white";
  }
  update(dt) {
    this.text = "fps: " + (1 / dt).toFixed(1);
  }
  draw(ctx) {
    ctx.textBaseline = "top";
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, 1);
  }
}
//# sourceMappingURL=fpscounter.js.map
