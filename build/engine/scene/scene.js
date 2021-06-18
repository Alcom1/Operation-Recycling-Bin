import {GMULTX, GMULTY} from "../utilities/math.js";
export default class Scene {
  constructor(engine2, {
    name = "nameless",
    need = [],
    zIndex = 0,
    gameObjects = [],
    initialized = false
  }) {
    this.engine = engine2;
    this.name = name;
    this.need = need;
    this.zIndex = zIndex;
    this.gameObjects = [];
    this.initialized = false;
  }
  init(ctx, scenes) {
    if (!this.initialized && this.need.every((n) => this.engine.tag.exists(n))) {
      ctx.save();
      this.gameObjects.forEach((go) => go.init(ctx, scenes));
      ctx.restore();
      this.initialized = true;
    }
  }
  clear() {
    this.gameObjects = [];
  }
  pushGO(gameObject) {
    gameObject.parent = this;
    this.gameObjects.push(gameObject);
  }
  sortGO() {
    this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
  }
  update(dt) {
    if (this.initialized) {
      this.gameObjects.forEach((go) => go.update(dt));
    }
  }
  draw(ctx) {
    if (this.initialized) {
      for (const go of this.gameObjects) {
        ctx.save();
        ctx.translate(go.gpos.x * GMULTX + go.spos.x, go.gpos.y * GMULTY + go.spos.y);
        go.draw(ctx);
        ctx.restore();
      }
    }
  }
}
//# sourceMappingURL=scene.js.map
