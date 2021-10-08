import GameObject from "../../engine/gameobjects/gameobject.js";
import {colRectRectCornerSize} from "../../engine/utilities/math.js";
export default class CharacterHandler extends GameObject {
  init(ctx) {
    this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level");
    this.obstacles = this.engine.tag.get(["BrickBase"], "Level").filter((b) => !b.tags.includes("Brick"));
  }
  getCollisionBoxes(min, max) {
    return this.characters.filter((c) => {
      return c.isActive && colRectRectCornerSize(min, max, c.gpos.getAdd({x: -1, y: 1 - c.height}), {x: 2, y: c.height});
    });
  }
}
//# sourceMappingURL=characterhandler.js.map
