import Character from "./character.js";
import {BOUNDARY, bitStack, GMULTX} from "../../engine/utilities/math.js";
import Animat from "./animation.js";
var ArmorState;
(function(ArmorState2) {
  ArmorState2[ArmorState2["NONE"] = 0] = "NONE";
  ArmorState2[ArmorState2["ACTIVE"] = 1] = "ACTIVE";
  ArmorState2[ArmorState2["FLASH"] = 2] = "FLASH";
})(ArmorState || (ArmorState = {}));
var FlightState;
(function(FlightState2) {
  FlightState2[FlightState2["NONE"] = 0] = "NONE";
  FlightState2[FlightState2["JUMP"] = 1] = "JUMP";
  FlightState2[FlightState2["UPWARD"] = 2] = "UPWARD";
})(FlightState || (FlightState = {}));
const characterBotOverride = Object.freeze({
  height: 4,
  speed: 2.5,
  images: [
    {name: "char_bot_left", offsetX: 36},
    {name: "char_bot_right", offsetX: 14},
    {name: "char_bot_left_armor", offsetX: 36},
    {name: "char_bot_right_armor", offsetX: 14}
  ],
  frameCount: 10,
  animsCount: 2,
  animsMisc: [{
    images: [{name: "char_bot_bin"}],
    gposOffset: {x: -1, y: 0},
    zModifier: 150,
    frameCount: 12
  }, {
    images: [{name: "char_bot_explosion"}],
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
    isSliced: true
  }, {
    images: [
      {name: "char_bot_armor_left", offsetX: 36},
      {name: "char_bot_armor_right", offsetX: 14}
    ],
    gposOffset: {x: -1, y: 0},
    frameCount: 12,
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
  constructor(params) {
    super(Object.assign(params, characterBotOverride));
    this.timerSpc = 0;
    this.timerArm = 0;
    this.ceilSubOffset = -6;
    this.vertSpeed = 500;
    this.horzSpeed = 700;
    this.jumpOrigin = {x: 0, y: 0};
    this.flightState = 0;
    this.armorDelay = 2;
    this.armorFlashRate = 8;
    this.armorState = 0;
    params.animsMisc.forEach((m) => {
      var newIndex = this.animatGroups.push([]) - 1;
      for (let i = -1; i <= (m.isSliced ? 1 : -1); i++) {
        this.animatGroups[newIndex].push(new Animat({
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
  get animImageIndex() {
    return this.move.x * (this.armorState == 1 ? 2 : this.armorState == 2 ? 1 + Math.floor(this.timerArm * this.armorFlashRate) % 2 : 1);
  }
  update(dt) {
    super.update(dt);
    if (this.armorState == 2) {
      this.timerArm += dt;
      this.animatGroupCurr.forEach((x) => x.setImageIndex(this.animImageIndex));
      if (this.timerArm > this.armorDelay) {
        this.armorState = 0;
        this.timerArm = 0;
      }
    }
  }
  handleSpecialMovement(dt) {
    this.timerSpc += dt;
    switch (this.animatGroupsIndex) {
      case 3:
        if (this.flightState == 1) {
          this.moveVertical(dt);
          this.spos.x += this.move.x * this.horzSpeed * dt;
        } else {
          this.vertSpeed = Math.abs(this.vertSpeed) * (this.flightState == 2 ? 1 : -1);
          this.moveVertical(dt);
          this.flightState = 0;
        }
        break;
      default:
        break;
    }
    if (this.timerSpc > this.animatGroupCurr[0].duration) {
      this.timerSpc = 0;
      switch (this.animatGroupsIndex) {
        case 2:
          this.isActive = false;
          break;
        case 3:
          this.animatGroupCurr.forEach((a) => a.reset());
          break;
        default:
          this.setCurrentGroup(0);
          break;
      }
    }
  }
  moveVertical(dt) {
    this.spos.y -= dt * this.vertSpeed;
    const dir = Math.sign(this.vertSpeed);
    if ((this.flightState != 1 || Math.abs(this.jumpOrigin.x - this.gpos.x) < 4) && this.getCollisionVetical(dir)) {
      this.animatGroupCurr.forEach((a) => a.spos = this.spos);
    } else {
      if (dir > 0) {
        this.flightState = 2;
        this.spos.x = 0;
        this.spos.y = this.ceilSubOffset;
        this.animatGroupCurr.forEach((a) => {
          a.zModifierPub = 0;
          a.spos.y = this.ceilSubOffset;
        });
      } else {
        this.spos.x = 0;
        this.timerSpc = 0;
        this.vertSpeed = Math.abs(this.vertSpeed);
        this.handleBricks();
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
  setFlightState(state) {
    this.flightState = state;
    this.jumpOrigin = this.gpos.get();
    if (this.animatGroupsIndex != 3) {
      this.handleBricks(true);
      this.setCurrentGroup(3);
      this.spos.x = 0;
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
    }, {
      mask: 80,
      min: this.gpos.getAdd({x: -1 - Math.min(this.move.x, 0), y: 0}),
      max: this.gpos.getAdd({x: -Math.min(this.move.x, 0), y: 1})
    }];
  }
  resolveCollision(mask) {
    if (mask & 2) {
      this.setCurrentGroup(1);
    } else if (mask & 4 && this.isNormalMovment) {
      if (this.armorState == 1) {
        this.armorState = 2;
      } else if (this.armorState == 0) {
        this.setCurrentGroup(2);
      }
    } else if (mask & 8) {
      this.setFlightState(2);
    } else if (mask & 16) {
      this.armorState = 1;
      this.setCurrentGroup(4);
    } else if (mask & 64) {
      this.setFlightState(1);
    }
  }
}
//# sourceMappingURL=characterbot.js.map
