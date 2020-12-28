import GameObject from "../../engine/gameobjects/gameobject.js";
import {colorTranslate, colorMult, GMULTY, Z_DEPTH, BOUNDARY} from "../../engine/utilities/math.js";
export default class Background extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.color = colorTranslate("grey");
    this.image = new Image();
    this.colorDark = colorMult(this.color, 0.625);
    this.image.src = this.engine.baker.bake((ctx) => this.drawBackground(ctx));
  }
  draw(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
  drawBackground(ctx) {
    ctx.fillStyle = this.colorDark;
    for (let i = 0; i < BOUNDARY.maxy + 1; i++) {
      ctx.beginPath();
      ctx.moveTo(0, GMULTY);
      ctx.lineTo(0, 0);
      ctx.lineTo(Z_DEPTH, -Z_DEPTH);
      ctx.lineTo(Z_DEPTH, GMULTY - Z_DEPTH);
      ctx.fill();
      ctx.translate(0, GMULTY);
    }
  }
}
//# sourceMappingURL=background.js.map
