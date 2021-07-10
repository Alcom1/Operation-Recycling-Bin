import Character from "./character.js";
import {BOUNDARY, GMULTX, bitStack} from "../../engine/utilities/math.js";
import SpriteAnimated from "./spriteanimated.js";
const characterBotOverride = Object.freeze({
  height: 4,
  speed: 2.5,
  images: [
    {name: "char_bot_left", offset: 36},
    {name: "char_bot_right", offset: 14}
  ],
  imagesMisc: [
    {name: "char_bot_bin", offset: 0}
  ],
  animFrames: 10,
  animCount: 2
});
const cbc = Object.freeze({
  flor: bitStack([0, 7]),
  down: bitStack([1, 8]),
  ceil: bitStack([2, 9]),
  head: bitStack([3]),
  wall: bitStack([4, 5]),
  step: bitStack([6])
});
export default class CharacterBot extends Character {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, characterBotOverride));
    this.timer = 0;
    var newIndex = this.spriteGroups.push([]) - 1;
    this.spriteGroups[newIndex].push(new SpriteAnimated(this.engine, {
      ...params,
      images: params.imagesMisc,
      order: 0,
      offset: -GMULTX,
      width: 126,
      animFrames: 12,
      animCount: 1,
      speed: 1
    }));
    this.parent.pushGO(this.spriteGroups[newIndex][0]);
  }
  init(ctx, scenes) {
    super.init(ctx, scenes);
  }
  handleUniqueMovmeent(dt) {
    this.timer += dt;
    if (this.timer > 1) {
      this.timer = 0;
      this.setCurrentGroup(0);
    }
  }
  handleCollision() {
    let cbm = this.brickHandler.checkCollisionSuper(this.gpos.getSub({x: this.move.x > 0 ? 1 : 0, y: 5}), 5, 15, 7, this.move.x);
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
