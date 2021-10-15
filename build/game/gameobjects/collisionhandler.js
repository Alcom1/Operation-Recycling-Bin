import GameObject from "../../engine/gameobjects/gameobject.js";
import {colRectRectCorners} from "../../engine/utilities/math.js";
export default class CollisionHandler extends GameObject {
  init(ctx) {
    this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level");
    this.obstacles = this.engine.tag.get(["Brick"], "Level").filter((b) => !b.tags.includes("BrickNormal"));
  }
  getCollisionBoxes(min, max) {
    return this.getCBsFromCharacters(min, max).concat(this.getCBsFromObstacles(min, max, 1, 2));
  }
  getCBsFromObstacles(min, max, yUp, yDown) {
    const ret = [];
    this.obstacles.forEach((obstacle) => {
      const c = {
        min: obstacle.gpos.getAdd({x: 0, y: -yUp}),
        max: obstacle.gpos.getAdd({x: obstacle.width, y: yDown})
      };
      if (colRectRectCorners(min, max, c.min, c.max)) {
        ret.push(c);
      }
    });
    return ret;
  }
  getCBsFromCharacters(min, max) {
    const ret = [];
    this.characters.filter((c) => c.isActive).forEach((character2) => {
      const c = {
        min: character2.gpos.getAdd({x: -1, y: 1 - character2.height}),
        max: character2.gpos.getAdd({x: 1, y: 1})
      };
      if (colRectRectCorners(min, max, c.min, c.max)) {
        ret.push(c);
      }
    });
    return ret;
  }
}
//# sourceMappingURL=collisionhandler.js.map
