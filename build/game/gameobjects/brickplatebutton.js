import BrickPlate from "./brickplate.js";
const brickButtonOverride = Object.freeze({
  images: ["brick_button_off", "brick_button_on"],
  width: 2
});
export default class BrickPlateButton extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickButtonOverride));
  }
}
//# sourceMappingURL=brickplatebutton.js.map
