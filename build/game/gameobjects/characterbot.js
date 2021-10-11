import Character from "./character.js";
import {BOUNDARY, bitStack, colRectRectSizes} from "../../engine/utilities/math.js";
import Animation from "./animation.js";
const characterBotOverride = Object.freeze({
  height: 4,
  speed: 2.5,
  images: [
    {name: "char_bot_left", offsetX: 36},
    {name: "char_bot_right", offsetX: 14}
  ],
  imagesMisc: [
    {name: "char_bot_bin", offsetX: 0}
  ],
  frameCount: 10,
  animsCount: 2
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
    this.bins = [];
    var newIndex = this.spriteGroups.push([]) - 1;
    this.spriteGroups[newIndex].push(new Animation(this.engine, {
      ...params,
      images: params.imagesMisc,
      sliceIndex: 0,
      frameWidth: 126,
      gposOffset: {x: -1, y: 0},
      frameCount: 12,
      animsCount: 1,
      speed: 1
    }));
    this.parent.pushGO(this.spriteGroups[newIndex][0]);
  }
  init(ctx, scenes) {
    super.init(ctx, scenes);
    this.bins = this.engine.tag.get("CharacterBin", "Level");
  }
  handleUniqueMovmeent(dt) {
    this.timer += dt;
    if (this.timer > 1) {
      this.timer = 0;
      this.setCurrentGroup(0);
    }
  }
  handleCollision() {
    this.bins.forEach((b) => {
      if (b.isActive && colRectRectSizes(this.gpos, {x: 2, y: this.height}, b.gpos.getAdd({x: 0, y: 1}), {x: 2, y: b.height - 1})) {
        var ary = this.gpos.y;
        var arh = this.height;
        var bry = b.gpos.y;
        var brh = b.height;
        var aminy = ary;
        var amaxy = ary + arh;
        var bminy = bry;
        var bmaxy = bry + brh;
        b.deactivate();
        this.setCurrentGroup(1);
      }
    });
    let cbm = this.brickHandler.checkCollisionRange(this.gpos.getSub({x: this.move.x > 0 ? 1 : 0, y: 5}), 5, 15, 7, this.move.x);
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
