import Character from "./character.js";
const characterBinOverride = Object.freeze({
  height: 3,
  speed: 0,
  images: [
    {name: "char_bin", offsetX: 0}
  ],
  frameCount: 1,
  animsCount: 1
});
export default class CharacterBin extends Character {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, characterBinOverride));
  }
}
//# sourceMappingURL=characterbin.js.map
