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
      this.gameObjects.forEach((go) => {
        if (!go.isActive) {
          return;
        }
        go.update(dt);
      });
    }
  }
  draw(ctx) {
    if (this.initialized) {
      this.gameObjects.filter((go) => go.isActive).forEach((go) => this.subDraw(ctx, go, go.draw));
      this.gameObjects.filter((go) => go.isActive).forEach((go) => this.subDraw(ctx, go, go.superDraw));
    }
  }
  subDraw(ctx, gameObject, drawAction) {
    ctx.save();
    ctx.translate(gameObject.gpos.x * GMULTX + gameObject.spos.x, gameObject.gpos.y * GMULTY + gameObject.spos.y);
    drawAction.call(gameObject, ctx);
    ctx.restore();
  }
}
//# sourceMappingURL=scene.js.map
