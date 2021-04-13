import Character from "./character.js";
import {BOUNDARY, GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class CharacterBot extends Character {
  constructor() {
    super(...arguments);
    this.sceneName = null;
  }
  init(ctx) {
    super.init(ctx);
  }
  handleCollision() {
    let cbm = this.brickHandler.checkCollisionSuper(this.gpos.getSub(new Vect(this.move.x > 0 ? 1 : 0, this.size.y + 1)), this.size.y + 1, 2 * (this.size.y + 3), this.size.y + 3, this.move.x);
    if (this.gpos.x - 1 < BOUNDARY.minx || this.gpos.x + 1 > BOUNDARY.maxx) {
      this.move.x *= -1;
      this.gpos.x += this.move.x;
    } else {
      if (cbm & 48) {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
      } else if (cbm & 8 && cbm & 129) {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
      } else if (cbm & 64) {
        if (cbm & 4) {
          this.move.x *= -1;
          this.gpos.x += this.move.x;
        } else {
          this.gpos.y -= 1;
        }
      } else if (cbm & 129) {
      } else if (cbm & 258) {
        this.gpos.y += 1;
      } else {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
      }
    }
  }
  draw(ctx) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 4;
    ctx.strokeRect(-GMULTX, GMULTY, this.size.x * GMULTX, -this.size.y * GMULTY);
    ctx.translate(-this.spos.x, 0);
    ctx.fillStyle = "#FF0";
    ctx.beginPath();
    ctx.moveTo(-GMULTX * this.size.x / 2, GMULTY);
    ctx.lineTo(-GMULTX * this.size.x / 2, GMULTY - this.size.y * GMULTY + (this.move.x < 0 ? 1 : 0) * GMULTY);
    ctx.lineTo(0, GMULTY - this.size.y * GMULTY);
    ctx.lineTo(GMULTX * this.size.x / 2, GMULTY - this.size.y * GMULTY + (this.move.x > 0 ? 1 : 0) * GMULTY);
    ctx.lineTo(GMULTX * this.size.x / 2, GMULTY);
    ctx.fill();
  }
}
//# sourceMappingURL=characterbot.js.map
