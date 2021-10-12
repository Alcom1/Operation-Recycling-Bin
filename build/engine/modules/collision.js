import {colRectRectCorners} from "../utilities/math.js";
export default class CollisionModule {
  constructor() {
    this.scenes = [];
  }
  pushGOs(sceneName, gameObjects) {
    var max = 0;
    const collidables = gameObjects.filter((g) => {
      const curr = g.getColliders();
      curr.forEach((c) => max = Math.max(max, c.mask));
      return curr.length > 0;
    });
    this.scenes.push({
      name: sceneName,
      maskMax: max.toString(2).length,
      gameObjects: collidables
    });
  }
  update() {
    this.scenes.forEach((s) => {
      const gocs = s.gameObjects.map((go) => {
        return {
          colliders: go.getColliders(),
          gameObject: go
        };
      });
      const length = gocs.length;
      for (var j = 0; j < length; j++) {
        for (var i = 0; i < j; i++) {
          this.compareGOColliders(gocs[i], gocs[j]);
        }
      }
    });
  }
  compareGOColliders(goc1, goc2) {
    goc1.colliders.forEach((c1) => goc2.colliders.forEach((c2) => this.compareGOPair(c1, c2, goc1.gameObject, goc2.gameObject)));
  }
  compareGOPair(c1, c2, g1, g2) {
    if (c1.mask & c2.mask && this.compareColliders(c1, c2)) {
      g1.resolveCollision(g2);
      g2.resolveCollision(g1);
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
