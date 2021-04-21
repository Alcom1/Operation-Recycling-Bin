import Character from "./character.js";
import {BOUNDARY, GMULTX, GMULTY, bitStack} from "../../engine/utilities/math.js";
const characterBotOverride = Object.freeze({
  speed: 2.5
});
const cbc = Object.freeze({
  flor: bitStack([0, 7]),
  down: bitStack([1, 8]),
  ceil: bitStack([2]),
  head: bitStack([3]),
  wall: bitStack([4, 5]),
  step: bitStack([6])
});
export default class CharacterBot extends Character {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, characterBotOverride));
    this.sceneName = null;
    this._height = 4;
  }
  init(ctx) {
    super.init(ctx);
  }
  handleCollision() {
    let cbm = this.brickHandler.checkCollisionSuper(this.gpos.getSub({x: this.move.x > 0 ? 1 : 0, y: 5}), 5, 14, 7, this.move.x);
    if (this.gpos.x - 1 < BOUNDARY.minx || this.gpos.x + 1 > BOUNDARY.maxx) {
      this.reverse();
    } else {
      if (cbm & cbc.wall) {
        this.reverse();
      } else if (cbm & cbc.head && cbm & cbc.flor) {
        this.reverse();
      } else if (cbm & cbc.step) {
        if (cbm & cbc.ceil || this.gpos.y <= BOUNDARY.miny + 3) {
          this.reverse();
        } else {
          this.gpos.y -= 1;
        }
      } else if (cbm & cbc.flor) {
      } else if (cbm & cbc.down) {
        this.gpos.y += 1;
      } else {
        this.reverse();
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
