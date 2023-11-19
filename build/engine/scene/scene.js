import {GMULTX, GMULTY} from "../utilities/math.js";
export default class Scene {
  constructor(engine2, {
    name = "unnamed",
    need = [],
    zIndex = 0
  }) {
    this.engine = engine2;
    this.name = name;
    this.need = need;
    this.zIndex = zIndex;
    this.gameObjects = [];
    this.initialized = false;
  }
  init(ctx) {
    if (!this.initialized && this.need.every((n) => this.engine.tag.exists(n))) {
      ctx.save();
      this.gameObjects.forEach((go) => go.init(ctx));
      ctx.restore();
      this.engine.sync.pushGOs(this.name, this.gameObjects);
      this.engine.collision.pushGOs(this.name, this.gameObjects);
      this.initialized = true;
    }
  }
  pushGO(gameObject) {
    gameObject.parent = this;
    this.gameObjects.push(gameObject);
    this.engine.tag.pushGO(gameObject, this.name);
    return gameObject;
  }
  update(dt) {
    if (this.initialized) {
      this.gameObjects.filter((go) => go.isActive).forEach((go) => go.update(dt));
    }
  }
  draw(ctx) {
    this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
    if (this.initialized) {
      this.gameObjects.filter((go) => go.isActive).forEach((go) => this.subDraw(ctx, go, go.draw));
    }
  }
  superDraw(ctx) {
    if (this.initialized) {
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
