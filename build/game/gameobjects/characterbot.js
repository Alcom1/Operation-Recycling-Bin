import Character from "./character.js";
import {BOUNDARY, bitStack} from "../../engine/utilities/math.js";
import Animat from "./animation.js";
const characterBotOverride = Object.freeze({
  height: 4,
  speed: 2.5,
  images: [
    {name: "char_bot_left", offsetX: 36},
    {name: "char_bot_right", offsetX: 14}
  ],
  imagesMisc: [{
    images: [{name: "char_bot_bin", offsetX: 0}],
    framesSize: 126,
    gposOffset: {x: -1, y: 0},
    frameCount: 12
  }, {
    images: [{name: "char_bot_explosion", offsetX: 0}],
    framesSize: 200,
    gposOffset: {x: -3, y: 0},
    frameCount: 16,
    loop: false
  }],
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
    params.imagesMisc.forEach((i) => {
      var newIndex = this.spriteGroups.push([]) - 1;
      this.spriteGroups[newIndex].push(new Animat(this.engine, {
        images: i.images,
        framesSize: i.framesSize,
        gposOffset: i.gposOffset,
        frameCount: i.frameCount,
        loop: i.loop
      }));
      this.parent.pushGO(this.spriteGroups[newIndex][0]);
    });
  }
  init(ctx, scenes) {
    super.init(ctx, scenes);
    this.bins = this.engine.tag.get("CharacterBin", "Level");
  }
  handleUniqueMovmeent(dt) {
    this.timer += dt;
    if (this.timer > 1) {
      switch (this.spriteGroupIndex) {
        case 1:
          this.timer = 0;
          this.setCurrentGroup(0);
          break;
        default:
          this.isActive = false;
          break;
      }
    }
  }
  handleCollision() {
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
  getColliders() {
    return [{
      mask: 7,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}),
      max: this.gpos.getAdd({x: 1, y: 1})
    }, {
      mask: 0,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}),
      max: this.gpos.getAdd({x: 1, y: 1})
    }];
  }
  resolveCollision(mask) {
    if (mask & 2) {
      this.setCurrentGroup(1);
    } else if (mask & 4 && this.isNormalMovment) {
      this.setCurrentGroup(2);
    }
  }
}
//# sourceMappingURL=characterbot.js.map
