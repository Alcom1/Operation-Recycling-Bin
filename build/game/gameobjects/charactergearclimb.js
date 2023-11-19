import {zip} from "../../engine/utilities/math.js";
import CharacterGear, {GearState} from "./charactergear.js";
const CharacterGearClimbOverride = Object.freeze({
  height: 2,
  speed: 3,
  animMain: {
    images: [
      {name: "char_rbc_left", offsetX: 0},
      {name: "char_rbc_right", offsetX: 0},
      {name: "char_rbc_up", offsetX: 0},
      {name: "char_rbc_down", offsetX: 0}
    ],
    frameCount: 2,
    animsCount: 1
  },
  isGlide: true,
  animsMisc: [{
    speed: 3,
    images: [{name: "char_rbc_stop", offsetX: 0}],
    frameCount: 2,
    gposOffset: {x: -3, y: 0}
  }, {
    speed: 3,
    images: [{name: "char_rbc_up", offsetX: 0}],
    frameCount: 2,
    gposOffset: {x: -3, y: 0}
  }]
});
export default class CharacterGearClimb extends CharacterGear {
  constructor(params) {
    super(Object.assign(params, CharacterGearClimbOverride));
    this.vertMax = 3;
    this.vertCount = 0;
  }
  get animationSubindex() {
    switch (this.move.y) {
      case 0:
        return this.move.x;
      case -1:
        return zip(2);
      default:
        return zip(3);
    }
  }
  handleStep() {
    if (this.stateIndex != GearState.NORMAL) {
      return;
    }
    switch (this.move.y) {
      case 0:
        this.moveAll({x: this.move.x, y: 0});
        break;
      case 1:
        this.moveAll({x: 0, y: 1});
        break;
      case -1:
        this.moveAll({x: 0, y: -1});
        this.vertCount++;
        break;
    }
  }
  handleStepUpdate(proxs) {
    super.handleStepUpdate(proxs);
    switch (this.stateIndex) {
      case GearState.NORMAL:
        switch (this.move.y) {
          case 0:
          case 1:
            this.handleStandardStep();
            break;
          case -1:
            if (!this.isColFace && this.isColLand && !proxs.some((p) => p.y == 2 && Math.sign(p.x) == this.move.x)) {
              this.vertCount = 0;
              this.move.y = 0;
              this.setStateIndex(GearState.NORMAL);
            } else if (!this.isColBack && this.isColBand && !proxs.some((p) => p.y == 2 && Math.sign(p.x) == -this.move.x)) {
              this.vertCount = 0;
              this.move.y = 0;
              this.setStateIndex(GearState.NORMAL);
              this.reverse();
            } else if (this.isColRoof || this.vertCount >= 3) {
              this.vertCount = 0;
              this.reverse();
              this.setStateIndex(GearState.WAIT);
            }
            break;
        }
        break;
      case GearState.STOP:
        this.handleStandardStep();
        break;
      case GearState.WAIT:
        if (!this.isColFlor) {
          this.move.y = 1;
          this.setStateIndex(GearState.NORMAL);
        } else if (!this.isColRoof) {
          this.move.y = -1;
          this.setStateIndex(GearState.NORMAL);
        } else if (!this.isColBack) {
          this.move.y = 0;
          this.setStateIndex(GearState.NORMAL);
          this.reverse();
        } else if (!this.isColFace) {
          this.move.y = 0;
          this.setStateIndex(GearState.NORMAL);
        } else {
          this.move.y = 0;
          this.setStateIndex(GearState.STOP);
        }
        break;
    }
  }
  handleStandardStep() {
    if (!this.isColFlor) {
      this.move.y = 1;
      this.setStateIndex(GearState.NORMAL);
    } else if (!this.isColFace) {
      this.move.y = 0;
      this.setStateIndex(GearState.NORMAL);
    } else if (!this.isColRoof) {
      this.move.y = 0;
      this.setStateIndex(GearState.WAIT);
    } else if (!this.isColBack) {
      this.move.y = 0;
      this.setStateIndex(GearState.WAIT);
    } else {
      this.move.y = 0;
      this.setStateIndex(GearState.STOP);
    }
  }
}
//# sourceMappingURL=charactergearclimb.js.map
