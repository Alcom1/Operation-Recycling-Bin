import GameObject from "../../engine/gameobjects/gameobject.js";
import {GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Character extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.text = "";
    this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
    this.speed = params.speed ?? 1;
  }
  update(dt) {
    this.spos.x += this.speed * GMULTX * dt;
    if (this.spos.x > GMULTX) {
      this.spos.x -= GMULTX;
      this.gpos.x += 1;
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#F00";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, 0, this.size.x * GMULTX, -this.size.y * GMULTY);
  }
}
//# sourceMappingURL=character.js.map
