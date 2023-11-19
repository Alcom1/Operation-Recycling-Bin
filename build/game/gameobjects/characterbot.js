import Character from "./character.js";
import {BOUNDARY, bitStack, GMULTY, GMULTX, MASKS, Faction} from "../../engine/utilities/math.js";
var ArmorState;
(function(ArmorState2) {
  ArmorState2[ArmorState2["NONE"] = 0] = "NONE";
  ArmorState2[ArmorState2["ACTIVE"] = 1] = "ACTIVE";
  ArmorState2[ArmorState2["FLASH"] = 2] = "FLASH";
})(ArmorState || (ArmorState = {}));
var BotState;
(function(BotState2) {
  BotState2[BotState2["NORMAL"] = 0] = "NORMAL";
  BotState2[BotState2["HALTED"] = 1] = "HALTED";
  BotState2[BotState2["EATING"] = 2] = "EATING";
  BotState2[BotState2["HAZARD"] = 3] = "HAZARD";
  BotState2[BotState2["FLYING"] = 4] = "FLYING";
  BotState2[BotState2["BOUNCE"] = 5] = "BOUNCE";
  BotState2[BotState2["SHIELD"] = 6] = "SHIELD";
})(BotState || (BotState = {}));
const characterBotOverride = Object.freeze({
  faction: Faction.FRIENDLY,
  height: 4,
  speed: 3,
  stateAnimations: [1, 2, 3, 4, 4, 5],
  animMain: {
    images: [
      {name: "char_bot_left"},
      {name: "char_bot_right"},
      {name: "char_bot_left_armor"},
      {name: "char_bot_right_armor"}
    ],
    frameCount: 10,
    animsCount: 2
  },
  animsMisc: [{
    images: [
      {name: "char_bot_left"},
      {name: "char_bot_right"},
      {name: "char_bot_left_armor"},
      {name: "char_bot_right_armor"}
    ],
    speed: 0,
    gposOffset: {x: -3, y: 0},
    frameCount: 10,
    animsCount: 2
  }, {
    images: [{name: "char_bot_bin"}],
    gposOffset: {x: -1, y: 0},
    frameCount: 12
  }, {
    images: [{name: "char_bot_explosion"}],
    gposOffset: {x: -3, y: 0},
    frameCount: 16,
    isLoop: false
  }, {
    images: [
      {name: "char_bot_fly_left"},
      {name: "char_bot_fly_right"},
      {name: "char_bot_fly_left_armor"},
      {name: "char_bot_fly_right_armor"}
    ],
    speed: 3,
    gposOffset: {x: -3, y: 0},
    frameCount: 10,
    animsCount: 2
  }, {
    images: [
      {name: "char_bot_armor_left", offsetX: 36},
      {name: "char_bot_armor_right", offsetX: 14}
    ],
    gposOffset: {x: -1, y: 0},
    frameCount: 12
  }]
});
const gcb = Object.freeze({
  flor: bitStack(0, 7),
  down: bitStack(1, 8),
  ceil: bitStack(2, 9),
  head: bitStack(3),
  wall: bitStack(4, 5),
  step: bitStack(6)
});
const acb = Object.freeze({
  flor: bitStack(0, 6),
  head: bitStack(1, 7),
  face: bitStack(8, 9, 10),
  shin: bitStack(11),
  foot: bitStack(12)
});
export default class CharacterBot extends Character {
  constructor(params) {
    super(Object.assign(params, characterBotOverride));
    this.timerSpc = 0;
    this.timerArm = 0;
    this.timerStp = 0;
    this.ceilSubOffset = -6;
    this.vertSpeed = 360;
    this.vertMult = 1;
    this.vertBlock = false;
    this.horzSpeed = 300;
    this.jumpHeights = [0, 2, 3, 3, 2, 0];
    this.jumpOrigin = {x: 0, y: 0};
    this.armorDelay = 2;
    this.armorFlashRate = 8;
    this.armorState = 0;
  }
  get animationSubindex() {
    return this.move.x * (this.armorState == 1 ? 2 : this.armorState == 2 ? 1 + Math.floor(this.timerArm * this.armorFlashRate) % 2 : 1);
  }
  update(dt) {
    super.update(dt);
    this.timerStp += dt;
    if (this.armorState == 2) {
      this.timerArm += dt;
      this.animationsCurr.setImageIndex(this.animationSubindex);
      if (this.timerArm > this.armorDelay) {
        this.armorState = 0;
        this.timerArm = 0;
      }
    }
  }
  handleSpecialMovement(dt) {
    this.timerSpc += dt;
    switch (this.stateIndex) {
      case 2:
      case 4:
        this.moveVertical(dt, this.vertMult);
        break;
      case 5:
        this.moveBounce(dt);
        break;
      default:
        break;
    }
    if (this.timerSpc > this.animationsCurr.duration) {
      this.timerSpc = 0;
      switch (this.stateIndex) {
        case 3:
          this.deactivate();
          break;
        case 4:
          this.animationsCurr.reset();
          break;
        case 5:
          break;
        default:
          this.setStateIndex(0);
          break;
      }
    }
  }
  moveVertical(dt, dir) {
    if (!this.vertBlock) {
      this.spos.y -= dt * this.vertSpeed * dir;
      this.animationsCurr.spos = this.spos;
    }
    if (Math.abs(this.spos.y) > GMULTY) {
      this.moveAll({x: 0, y: Math.sign(this.spos.y)}, false);
      this.spos.y -= Math.sign(this.spos.y) * GMULTY;
    }
    this.handleBrickCollisionVertical();
    this.animationsCurr.reset(this.gpos, false);
    this.animationsCurr.spos = this.spos;
  }
  moveBounce(dt) {
    var index = Math.abs(this.gpos.x - this.jumpOrigin.x);
    if ((index > 0 || Math.abs(this.spos.x) > GMULTX / 2) && (this.gpos.x - 2 < BOUNDARY.minx || this.gpos.x + 2 > BOUNDARY.maxx)) {
      this.startVertMovement();
      return;
    }
    const cbm = this.brickHandler.checkCollisionRange(this.gpos.getSub({
      x: this.move.x > 0 ? 1 : 0,
      y: this.height + 1
    }), this.move.x, 5, 18, 6, 3);
    if (cbm & acb.face && (index > 0 || Math.abs(this.spos.x) > GMULTX / 2)) {
      this.startVertMovement();
      return;
    } else if ((cbm & acb.head || this.gpos.y <= BOUNDARY.miny + 3) && index < 2) {
      this.startVertMovement();
      return;
    } else if (cbm & acb.shin && index > 0) {
      this.startVertMovement();
      return;
    } else if (cbm & acb.foot && index > 2) {
      this.startVertMovement();
      return;
    } else if (cbm & acb.flor && index > 0) {
      this.endVertMovement();
      return;
    }
    if (index > this.jumpHeights.length - 2) {
      this.startVertMovement();
      return;
    }
    this.spos.x += this.move.x * this.horzSpeed * dt;
    this.spos.y = -GMULTY * (this.jumpHeights[index] + this.gpos.y - this.jumpOrigin.y + Math.abs(this.spos.x / GMULTX) * (this.jumpHeights[index + 1] - this.jumpHeights[index]));
    this.animationsCurr.spos = this.spos;
    var move = {
      x: Math.abs(this.spos.x) > GMULTX ? Math.sign(this.spos.x) : 0,
      y: Math.abs(this.spos.y) > GMULTY ? Math.sign(this.spos.y) : 0
    };
    if (move.x || move.y) {
      this.moveAll(move, false);
      this.spos.sub({
        x: move.x * GMULTX,
        y: move.y * GMULTY
      });
      this.animationsCurr.gpos.add(move);
    }
  }
  startVertMovement() {
    if (Math.abs(this.spos.x) > GMULTX / 2) {
      this.gpos.x += Math.sign(this.spos.x);
    }
    this.vertMult = -1;
    this.setStateIndex(4);
  }
  endVertMovement() {
    this.spos.setToZero();
    if (this.stateIndex == 4 || this.stateIndex == 5) {
      this.setStateIndex(1);
    }
  }
  getCollisionVertical(dir) {
    if (dir > 0 && this.gpos.y <= this.height + 1) {
      return true;
    }
    return !!this.brickHandler.checkCollisionRange(this.gpos.getSub({
      x: 1,
      y: dir > 0 ? 1 + this.height : 0
    }), 1, 0, 2, 1);
  }
  handleBrickCollisionNormal() {
    if (this.gpos.x - 2 < BOUNDARY.minx && this.move.x < 0 || this.gpos.x + 2 > BOUNDARY.maxx && this.move.x > 0) {
      this.reverse();
    } else {
      const cbm = this.brickHandler.checkCollisionRange(this.gpos.getSub({
        x: this.move.x > 0 ? 0 : 1,
        y: 1 + this.height
      }), this.move.x, 5, 15, 7, void 0, this.faction);
      if (cbm & gcb.wall) {
        this.reverse();
      } else if (cbm & gcb.head && cbm & gcb.flor) {
        this.reverse();
      } else if (cbm & gcb.step) {
        if (cbm & gcb.ceil || this.gpos.y <= BOUNDARY.miny + 3) {
          this.reverse();
        } else {
          this.walkstep(-1);
        }
      } else if (cbm & gcb.flor) {
        this.walkstep(0);
      } else if (cbm & gcb.down) {
        this.walkstep(1);
      } else {
        this.reverse();
      }
    }
  }
  walkstep(vOffset) {
    this.moveAll({
      x: this.move.x,
      y: vOffset
    });
  }
  handleBrickCollisionVertical() {
    this.vertBlock = false;
    if (this.getCollisionVertical(this.vertMult)) {
      this.vertBlock = true;
      if (this.vertMult > 0) {
        this.spos.y = this.ceilSubOffset;
        this.animationsCurr.spos.y = this.ceilSubOffset;
      } else {
        this.endVertMovement();
      }
    }
  }
  getColliders() {
    return [{
      mask: MASKS.death,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}),
      max: this.gpos.getAdd({x: 1, y: 1})
    }, {
      mask: MASKS.scrap | MASKS.float,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}),
      max: this.gpos.getAdd({x: 1, y: 2})
    }, {
      mask: MASKS.super | MASKS.jumps | MASKS.press,
      min: this.gpos.getAdd({x: -1 - Math.min(this.move.x, 0), y: 0}),
      max: this.gpos.getAdd({x: -Math.min(this.move.x, 0), y: 1})
    }];
  }
  setStateIndex(index) {
    let isBricksActive = [5, 4].every((x) => x != index);
    this.bricks.forEach((x) => x.isActive = isBricksActive);
    if (this.stateIndex != index) {
      this.timerSpc = 0;
      super.setStateIndex(index);
      if (this.stateIndex == 0) {
        this.animationsCurr.timer = this.timerStp;
      }
    }
  }
  handleStep() {
    this.timerStp = 0;
    switch (this.stateIndex) {
      case 1:
        this.setStateIndex(0);
        break;
      case 0:
        this.handleBrickCollisionNormal();
        break;
      default:
        break;
    }
  }
  resolveCollisions(collisions) {
    super.resolveCollisions(collisions);
    if (!collisions.find((c) => c.mask & MASKS.float) && this.stateIndex == 4) {
      this.vertMult = -1;
    }
  }
  resolveCollision(mask) {
    if (mask & MASKS.scrap) {
      this.vertMult = -1;
      this.setStateIndex(2);
    } else if (mask & MASKS.death && this.stateIndex != 2) {
      if (this.armorState == 1) {
        this.armorState = 2;
      } else if (this.armorState == 0) {
        this.setStateIndex(3);
      }
    } else if (mask & MASKS.float) {
      this.vertMult = 1;
      this.setStateIndex(4);
    } else if (mask & MASKS.jumps) {
      this.jumpOrigin = this.gpos.get();
      this.setStateIndex(5);
    } else if (mask & MASKS.super) {
      this.armorState = 1;
      this.setStateIndex(6);
    }
  }
}
//# sourceMappingURL=characterbot.js.map
