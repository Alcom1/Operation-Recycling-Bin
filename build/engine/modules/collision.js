import {colRectRectCorners, GMULTX, GMULTY} from "../utilities/math.js";
export default class CollisionModule {
  constructor() {
    this.scenes = [];
  }
  pushGOs(sceneName, sceneObjects) {
    const gameObjects = [];
    const passObjects = [];
    sceneObjects.forEach((go) => {
      const colliders = go.getColliders();
      gameObjects.push(go);
      if (colliders.some((c) => c.mask == 0)) {
        passObjects.push(go);
      }
    });
    if (gameObjects.length > 0 || passObjects.length > 0) {
      this.scenes.push({
        name: sceneName,
        gameObjects,
        passObjects
      });
    }
  }
  update() {
    this.scenes.forEach((s) => {
      const gocs = s.gameObjects.filter((go) => go.isActive).map((go) => {
        return {
          colliders: go.getColliders(),
          gameObject: go
        };
      });
      for (var j = 0; j < gocs.length; j++) {
        for (var i = 0; i < j; i++) {
          this.compareGOColliders(gocs[i], gocs[j]);
        }
      }
      s.gameObjects.forEach((go) => go.resolveClearCollisions());
    });
  }
  draw(ctx) {
    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 2;
    this.scenes.forEach((s) => s.gameObjects.filter((go) => go.isActive).forEach((go) => go.getColliders().forEach((c) => {
      if (c.isSub) {
        ctx.strokeStyle = "#000";
        ctx.strokeRect(c.min.x, c.min.y, c.max.x - c.min.x, c.max.y - c.min.y);
      } else {
        ctx.strokeStyle = `hsl(${c.mask.toString(2).length * 48},100%,50%)`;
        ctx.strokeRect(c.min.x * GMULTX + 1, c.min.y * GMULTY - 1, c.max.x * GMULTX - c.min.x * GMULTX, c.max.y * GMULTY - c.min.y * GMULTY);
      }
    })));
  }
  collidePassive(min, max) {
    return this.getPassiveColliders().filter((c) => colRectRectCorners(c.min, c.max, min, max));
  }
  getPassiveColliders() {
    return this.scenes.map((s) => s.passObjects).flat().map((go) => {
      return go.isActive ? go.getColliders().filter((c) => c.mask == 0) : [];
    }).flat();
  }
  compareGOColliders(goc1, goc2) {
    goc1.colliders.forEach((c1) => goc2.colliders.forEach((c2) => this.compareGOPair(c1, c2, goc1.gameObject, goc2.gameObject)));
  }
  compareGOPair(c1, c2, g1, g2) {
    if (c1.mask & c2.mask && this.compareColliders(c1, c2)) {
      g1.setCollision(c1.mask & c2.mask, g2);
      g2.setCollision(c1.mask & c2.mask, g1);
    }
  }
  compareColliders(c1, c2) {
    if (c1.isSub == c2.isSub) {
      return colRectRectCorners(c1.min, c1.max, c2.min, c2.max);
    } else {
      return colRectRectCorners(c1.isSub ? c1.min.getDiv(GMULTX, GMULTY) : c1.min, c1.isSub ? c1.max.getDiv(GMULTX, GMULTY) : c1.max, c2.isSub ? c2.min.getDiv(GMULTX, GMULTY) : c2.min, c2.isSub ? c2.max.getDiv(GMULTX, GMULTY) : c2.max);
    }
  }
  clear(sceneNames) {
    this.scenes = this.scenes.filter((sg) => !sceneNames.some((sn) => sg.name == sn));
  }
}
//# sourceMappingURL=collision.js.map
