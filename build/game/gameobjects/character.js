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
      var block = this.brickHandler.checkSelectionCollisionForward(this.gpos.getAdd(new Vect(this.move.x < 0 ? -1 : 0, 1 - this.size.y)), this.size.y + 2, this.move.x);
      console.log(block);
      if (this.gpos.x - 1 < BOUNDARY.minx || this.gpos.x + 1 > BOUNDARY.maxx || block > 0 && block < this.size.y - 1) {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
      } else {
        switch (block) {
          case -1:
            this.move.x *= -1;
            break;
          case 0:
            this.move.x *= -1;
            break;
          case this.size.y - 1:
            this.gpos.y -= 1;
            break;
          case this.size.y:
            break;
          case this.size.y + 1:
            this.gpos.y += 1;
            break;
        }
      }
      this.checkCollision = false;
    }
  }
  draw(ctx) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 4;
    ctx.strokeRect(-GMULTX, GMULTY, this.size.x * GMULTX, -this.size.y * GMULTY);
    ctx.translate(-this.spos.x, 0);
    ctx.fillStyle = this.move.x > 0 ? "#FF0" : "#00F";
    ctx.fillRect(-GMULTX, GMULTY, this.size.x * GMULTX, -this.size.y * GMULTY);
  }
}
//# sourceMappingURL=character.js.map
