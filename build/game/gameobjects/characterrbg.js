import {bitStack, BOUNDARY, GMULTX, GMULTY, MASKS} from "../../engine/utilities/math.js";
import Character from "./character.js";
const characterRomGOverride = Object.freeze({
  height: 2,
  speed: 5,
  images: [
    {name: "char_rbg_left", offsetX: 0},
    {name: "char_rbg_right", offsetX: 0}
  ],
  frameCount: 2,
  animsCount: 1,
  isGlide: true
});
const gcb = Object.freeze({
  flor: bitStack([2]),
  face: bitStack([0, 1])
});
export default class CharacterRBG extends Character {
  constructor(params) {
    super(Object.assign(params, characterRomGOverride));
  }
  handleCollision() {
    if (this.gpos.x - 1 < BOUNDARY.minx || this.gpos.x + 1 > BOUNDARY.maxx) {
      this.reverse();
    } else {
      const cbm = this.brickHandler.checkCollisionRange(this.gpos.getSub({
        x: this.move.x > 0 ? -1 : 2,
        y: this.height
      }), this.move.x, 0, 3, 3);
      if (cbm & gcb.face) {
        this.reverse();
      } else if (cbm & gcb.flor) {
      } else {
        this.reverse();
      }
    }
  }
  getColliders() {
    return [{
      mask: MASKS.block | MASKS.death | MASKS.enemy,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}).getMult(GMULTX, GMULTY).getAdd(this.spos),
      max: this.gpos.getAdd({x: 1, y: 1}).getMult(GMULTX, GMULTY).getAdd(this.spos),
      isSub: true
    }, {
      mask: 0,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}),
      max: this.gpos.getAdd({x: 1, y: 1})
    }];
  }
  resolveCollision(mask, other) {
    if (mask & (MASKS.enemy | MASKS.block)) {
      var targetDir = Math.sign(other.gpos.x - this.gpos.x);
      var facingDir = Math.sign(this.move.x);
      if (targetDir == facingDir) {
        this.reverse();
      }
    }
  }
}
//# sourceMappingURL=characterrbg.js.map
