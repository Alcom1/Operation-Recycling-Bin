import CharacterGear, {GearState} from "./charactergear.js";
const CharacterGearGroundOverride = Object.freeze({
  height: 2,
  speed: 5,
  animMain: {
    images: [
      {name: "char_rbg_left", offsetX: 0},
      {name: "char_rbg_right", offsetX: 0}
    ],
    frameCount: 2,
    animsCount: 1
  },
  isGlide: true,
  animsMisc: [{
    speed: 5,
    images: [{name: "char_rbg_stop", offsetX: 0}],
    frameCount: 2,
    gposOffset: {x: -3, y: 0}
  }, {
    speed: 3,
    images: [
      {name: "char_rbg_left", offsetX: 0},
      {name: "char_rbg_right", offsetX: 0}
    ],
    frameCount: 2,
    gposOffset: {x: -3, y: 0}
  }]
});
export default class CharacterGearGround extends CharacterGear {
  constructor(params) {
    super(Object.assign(params, CharacterGearGroundOverride));
  }
  handleStepUpdate(proxs) {
    super.handleStepUpdate(proxs);
    switch (this.stateIndex) {
      case GearState.NORMAL:
        if (this.isColFace || !this.isColLand) {
          if (this.isColBack || !this.isColBand) {
            this.setStateIndex(GearState.STOP);
          } else {
            this.reverse();
            this.setStateIndex(GearState.WAIT);
          }
        }
        break;
      case GearState.STOP:
      case GearState.WAIT:
        if (!this.isColFace && this.isColLand) {
          this.setStateIndex(GearState.NORMAL);
        } else if (!this.isColBack && this.isColBand) {
          this.reverse();
          this.setStateIndex(GearState.NORMAL);
        } else {
          this.setStateIndex(GearState.STOP);
        }
        break;
    }
  }
}
//# sourceMappingURL=charactergearground.js.map
