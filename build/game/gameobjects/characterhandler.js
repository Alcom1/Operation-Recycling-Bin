import GameObject from "../../engine/gameobjects/gameobject.js";
import {colRectRectCornerSize} from "../../engine/utilities/math.js";
export default class CharacterHandler extends GameObject {
  init(ctx) {
    this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level");
  }
  getCharacterBoxes(min, max) {
    return this.characters.filter((c) => c.isActive && colRectRectCornerSize(min.x, max.x, min.y, max.y, c.gpos.x - 1, c.gpos.y, 2, c.height));
  }
}
//# sourceMappingURL=characterhandler.js.map
