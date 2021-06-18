import Character from "./character.js";
import {BOUNDARY, bitStack} from "../../engine/utilities/math.js";
const characterBotOverride = Object.freeze({
  height: 4,
  speed: 2.5,
  imageRight: {name: "char_bot_right", offset: 14},
  imageLeft: {name: "char_bot_left", offset: 38},
  animFrames: 10,
  animCount: 2
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
  init(ctx, scenes) {
    super.init(ctx, scenes);
  }
  constructor(engine2, params) {
    super(engine2, Object.assign(params, characterBotOverride));
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
}
//# sourceMappingURL=characterbot.js.map
