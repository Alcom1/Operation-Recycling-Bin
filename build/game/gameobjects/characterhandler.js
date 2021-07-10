import GameObject from "../../engine/gameobjects/gameobject.js";
import {colRectRectCorners} from "../../engine/utilities/math.js";
export default class CharacterHandler extends GameObject {
  init(ctx) {
    this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level");
    this.characters.forEach((c) => console.log(c.tag));
  }
  getCharacterBoxes(min, max) {
    return this.characters.filter((c) => colRectRectCorners(min.x, max.x, min.y, max.y, c.gpos.x - 1, c.gpos.x + 1, c.gpos.y + 1 - c.height, c.gpos.y + 1));
  }
}
//# sourceMappingURL=characterhandler.js.map
