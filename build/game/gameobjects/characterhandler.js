import GameObject from "../../engine/gameobjects/gameobject.js";
import {colRectRectCornerSize} from "../../engine/utilities/math.js";
export default class CharacterHandler extends GameObject {
  init(ctx) {
    this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level");
    this.obstacles = this.engine.tag.get(["BrickBase"], "Level").filter((b) => !b.tags.includes("Brick"));
  }
  getCollisionBoxes(min, max) {
    this.characters.filter((c) => {
      return c.isActive && colRectRectCornerSize(min.x, max.x, min.y, max.y, c.gpos.x - 1, c.gpos.y + 1 - c.height, 2, c.height);
    });
    return this.characters.filter((c) => {
      return c.isActive && colRectRectCornerSize(min.x, max.x, min.y, max.y, c.gpos.x - 1, c.gpos.y + 1 - c.height, 2, c.height);
    });
  }
}
//# sourceMappingURL=characterhandler.js.map
