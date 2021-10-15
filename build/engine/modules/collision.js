import {colRectRectCorners} from "../utilities/math.js";
export default class CollisionModule {
  constructor() {
    this.scenes = [];
  }
  pushGOs(sceneName, sceneObjects) {
    const gameObjects = [];
    const passObjects = [];
    sceneObjects.forEach((go) => {
      const colliders = go.getColliders();
      if (colliders.some((c) => c.mask == 0)) {
        passObjects.push(go);
      }
      if (colliders.some((c) => c.mask > 0)) {
        gameObjects.push(go);
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
    });
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
      g1.resolveCollision(c1.mask & c2.mask);
      g2.resolveCollision(c1.mask & c2.mask);
    }
  }
  compareColliders(c1, c2) {
    return colRectRectCorners(c1.min, c1.max, c2.min, c2.max);
  }
  clear(sceneNames) {
    this.scenes = this.scenes.filter((sg) => !sceneNames.some((sn) => sg.name == sn));
  }
}
//# sourceMappingURL=collision.js.map
