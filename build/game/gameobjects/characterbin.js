import Character from "./character.js";
const characterBinOverride = Object.freeze({
  height: 3,
  speed: 0,
  images: [{name: "char_bin", offsetX: -9}],
  frameCount: 1,
  animsCount: 1
});
export default class CharacterBin extends Character {
  constructor(params) {
    super(Object.assign(params, characterBinOverride));
  }
  getColliders() {
    return [{
      mask: 2,
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
      this.deactivate();
    }
  }
}
//# sourceMappingURL=characterbin.js.map
