import GameObject from "../../engine/gameobjects/gameobject.js";
export default class FPSCounter extends GameObject {
  constructor(params) {
    super(params);
    this.text = "";
    this.font = params.font ?? "18pt Consolas";
    this.color = params.color || "white";
  }
  update(dt) {
    let fps = (1 / dt).toFixed(1);
    this.text = "fps:" + this.getSpaces(6 - fps.length) + fps;
  }
  getSpaces(count) {
    var ret = "";
    for (let i = 0; i < count; i++) {
      ret += " ";
    }
    return ret;
  }
  draw(ctx) {
    ctx.textBaseline = "top";
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, 1);
  }
}
//# sourceMappingURL=fpscounter.js.map
