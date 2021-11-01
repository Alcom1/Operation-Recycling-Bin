import Animat from "./animation.js";
import BrickPlate from "./brickplate.js";
const brickPlateHotOverride = Object.freeze({
  images: ["brick_plate", "brick_plate_hot"],
  width: 4
});
export default class BrickPlateHot extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickPlateHotOverride));
    this.animation = this.parent.pushGO(new Animat({
      ...params,
      subPosition: {x: 0, y: -25},
      zModifier: 40,
      images: [{name: "brick_plate_hot"}],
      speed: 2,
      frameCount: 7,
      isVert: true
    }));
    this.animation.isActive == this.isOn;
  }
  draw(ctx) {
    if (!this.isOn) {
      super.draw(ctx);
    }
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? [{
      mask: 4,
      min: this.gpos.getAdd({x: 1, y: -1}),
      max: this.gpos.getAdd({x: this.width - 1, y: 0})
    }] : []);
  }
}
//# sourceMappingURL=brickplatehot.js.map
