import GameObject from "../../engine/gameobjects/gameobject.js";
import {BOUNDARY, GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Character extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.text = "";
    this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
    this.speed = params.speed ?? 1;
    this.move = new Vect(1, 1);
    this.checkCollision = true;
  }
  init(ctx) {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
  }
  update(dt) {
    this.spos.x += this.move.x * this.speed * GMULTX * dt;
    if (Math.abs(this.spos.x) > GMULTX) {
      var dir = Math.sign(this.spos.x);
      this.spos.x -= GMULTX * dir;
      this.gpos.x += dir;
      this.checkCollision = true;
    }
    if (this.checkCollision) {
      if (this.move.x < 0 && (this.gpos.x <= BOUNDARY.minx || this.brickHandler.checkSelectionCollisionHorz(this.gpos.getAdd(new Vect(-1, 0)), this.size.y))) {
        this.move.x = 1;
      } else if (this.move.x > 0 && (this.gpos.x > BOUNDARY.maxx || this.brickHandler.checkSelectionCollisionHorz(this.gpos.getAdd(new Vect(this.size.x, 0)), this.size.y))) {
        this.move.x = -1;
      } else {
        this.checkCollision = false;
      }
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#FF0";
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, GMULTY, this.size.x * GMULTX, -this.size.y * GMULTY);
  }
}
//# sourceMappingURL=character.js.map
