import Character from "./character.js";
import {BOUNDARY, bitStack, GMULTY, GMULTX} from "../../engine/utilities/math.js";
import Animat from "./animation.js";
const characterBotOverride = Object.freeze({
  height: 4,
  speed: 2.5,
  images: [
    {name: "char_bot_left", offsetX: 36},
    {name: "char_bot_right", offsetX: 14}
  ],
  frameCount: 10,
  animsCount: 2,
  animsMisc: [{
    images: [{name: "char_bot_bin", offsetX: 0}],
    framesSize: 126,
    gposOffset: {x: -1, y: 0},
    zModifier: 150,
    frameCount: 12
  }, {
    images: [{name: "char_bot_explosion", offsetX: 0}],
    framesSize: 200,
    gposOffset: {x: -3, y: 0},
    zModifier: 600,
    frameCount: 16,
    isLoop: false
  }, {
    images: [
      {name: "char_bot_fly_left", offsetX: 36},
      {name: "char_bot_fly_right", offsetX: 14}
    ],
    speed: 2.5,
    gposOffset: {x: -1, y: 0},
    frameCount: 10,
    animsCount: 2,
    isLoop: true,
    isSliced: true
  }]
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
    this.ceilSubOffset = -6;
    this.verticalSpeed = 500;
    this.isFlight = false;
    params.animsMisc.forEach((m) => {
      var newIndex = this.animatGroups.push([]) - 1;
      for (let i = -1; i <= (m.isSliced ? 1 : -1); i++) {
        this.animatGroups[newIndex].push(new Animat(this.engine, {
          ...params,
          speed: m.speed,
          images: m.images,
          sliceIndex: m.isSliced ? i : null,
          framesSize: m.isSliced ? GMULTX * 2 : m.framesSize,
          gposOffset: m.gposOffset,
          zModifier: m.isSliced ? i < 1 ? 300 : 29 : m.zModifier,
          frameCount: m.frameCount,
          animsCount: m.animsCount,
          isLoop: m.isLoop
        }));
      }
      this.animatGroups[newIndex].forEach((a) => this.parent.pushGO(a));
    });
  }
  handleSpecialMovement(dt) {
    this.timer += dt;
    switch (this.animatGroupsIndex) {
      case 3:
        this.moveVertical(dt, this.isFlight ? 1 : -1);
        this.isFlight = false;
        break;
      default:
        break;
    }
    if (this.timer > this.animatGroupCurr[0].length) {
      switch (this.animatGroupsIndex) {
        case 1:
          this.timer = 0;
          this.setCurrentGroup(0);
          break;
        case 3:
          this.timer = 0;
          this.animatGroupCurr.forEach((a) => a.reset());
          break;
        default:
          this.isActive = false;
          break;
      }
    }
  }
  moveVertical(dt, dir = 1) {
    this.spos.y -= dir * dt * this.verticalSpeed;
    if (this.getCollisionVetical(dir)) {
      if (dir * this.spos.y < -GMULTY + this.ceilSubOffset) {
        this.gpos.y -= dir;
        this.spos.y += dir * GMULTY;
        this.animatGroupCurr.forEach((a) => {
          a.gpos.y -= dir;
          a.zModifierPub = dir > 0 && this.getCollisionVetical(dir) ? 200 : 0;
        });
      }
      this.animatGroupCurr.forEach((a) => a.spos = this.spos);
    } else {
      if (dir > 0) {
        this.spos.y = this.ceilSubOffset;
        this.animatGroupCurr.forEach((a) => {
          a.zModifierPub = 0;
          a.spos.y = this.ceilSubOffset;
        });
      } else {
        this.timer = 0;
        this.setCurrentGroup(0);
      }
    }
  }
  getCollisionVetical(dir) {
    if (dir > 0 && this.gpos.y <= this.height + 1) {
      return false;
    }
    return !this.brickHandler.checkCollisionRange(this.gpos.getSub({
      x: 1,
      y: dir > 0 ? 1 + this.height : 0
    }), 0, 2, 1, 1);
  }
  handleCollision() {
    const cbm = this.brickHandler.checkCollisionRange(this.gpos.getSub({
      x: this.move.x > 0 ? 1 : 0,
      y: 1 + this.height
    }), 5, 15, 7, this.move.x);
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
      mask: 15,
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
    } else if (mask & 8) {
      if (this.animatGroupsIndex != 3) {
        this.handleBricks(true);
        this.setCurrentGroup(3);
        this.animatGroupCurr.forEach((x) => x.setImageIndex(this.move.x));
        this.spos.x = 0;
      }
      this.isFlight = true;
    }
  }
}
//# sourceMappingURL=characterbot.js.map
