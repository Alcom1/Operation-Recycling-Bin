import {MASKS} from "../../engine/utilities/math.js";
import Character from "./character.js";
const characterBinOverride = Object.freeze({
  height: 2,
  speed: 0,
  animMain: {
    images: [{name: "char_bin", offsetX: -69}],
    frameCount: 1,
    animsCount: 1
  }
});
export default class CharacterBin extends Character {
  constructor(params) {
    super(Object.assign(params, characterBinOverride));
  }
  getColliders() {
    return [{
      mask: MASKS.block | MASKS.scrap | MASKS.water,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}),
      max: this.gpos.getAdd({x: 1, y: 1})
    }];
  }
  resolveCollision(mask) {
    if (mask & MASKS.scrap) {
      this.deactivate();
    }
  }
}
//# sourceMappingURL=characterbin.js.map
