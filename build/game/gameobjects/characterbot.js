import Character from "./character.js";
import {BOUNDARY, GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
const characterBotOverride = Object.freeze({
  speed: 2.5
});
export default class CharacterBot extends Character {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, characterBotOverride));
    this.sceneName = null;
  }
  init(ctx) {
    super.init(ctx);
  }
  handleCollision() {
    let cbm = this.brickHandler.checkCollisionSuper(this.gpos.getSub(new Vect(this.move.x > 0 ? 1 : 0, 5)), 5, 14, 7, this.move.x);
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
    ctx.strokeRect(-GMULTX, GMULTY, GMULTX * 2, GMULTY * -4);
    ctx.translate(-this.spos.x, 0);
    ctx.fillStyle = "#FF0";
    ctx.beginPath();
    ctx.moveTo(-GMULTX, GMULTY);
    ctx.lineTo(-GMULTX, GMULTY + GMULTY * -4 + (this.move.x < 0 ? 1 : 0) * GMULTY);
    ctx.lineTo(0, GMULTY + GMULTY * -4);
    ctx.lineTo(GMULTX, GMULTY + GMULTY * -4 + (this.move.x > 0 ? 1 : 0) * GMULTY);
    ctx.lineTo(GMULTX, GMULTY);
    ctx.fill();
  }
}
//# sourceMappingURL=characterbot.js.map
