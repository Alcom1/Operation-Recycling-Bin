import {bitStack, BOUNDARY} from "../../engine/utilities/math.js";
import Character from "./character.js";
const characterRomGOverride = Object.freeze({
  height: 3,
  speed: 6,
  images: [
    {name: "char_romg_left", offsetX: 0},
    {name: "char_romg_right", offsetX: 0}
  ],
  frameCount: 2,
  animsCount: 1
});
const gcb = Object.freeze({
  flor: bitStack([2]),
  face: bitStack([0, 1])
});
export default class CharacterRomG extends Character {
  constructor(params) {
    super(Object.assign(params, characterRomGOverride));
  }
  handleCollision() {
    if (this.gpos.x - 1 < BOUNDARY.minx || this.gpos.x + 1 > BOUNDARY.maxx) {
      this.reverse();
    } else {
      const cbm = this.brickHandler.checkCollisionRange(this.gpos.getSub({
        x: this.move.x > 0 ? 0 : 1,
        y: this.height - 1
      }), this.move.x, 0, 3, 3);
      if (cbm & gcb.face) {
        this.reverse();
      } else if (cbm & gcb.flor) {
      } else {
        this.reverse();
      }
    }
  }
}
//# sourceMappingURL=characterromg.js.map
