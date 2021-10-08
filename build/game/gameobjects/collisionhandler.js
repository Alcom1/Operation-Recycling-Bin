import GameObject from "../../engine/gameobjects/gameobject.js";
export default class CollisionHandler extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.characters = [];
  }
  init(ctx) {
    const brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    if (!brickHandler)
      throw new Error("Can't find BrickHandler");
    this.brickHandler = brickHandler;
    const characters = this.engine.tag.get("Character", "Level");
    this.characters = characters;
  }
  checkCollisionRange(pos, start, final, height, dir) {
    return this.brickHandler.checkCollisionRange(pos, start, final, height, dir);
  }
}
//# sourceMappingURL=collisionhandler.js.map
