export var StepType;
(function(StepType2) {
  StepType2[StepType2["START"] = 0] = "START";
  StepType2[StepType2["SYNC"] = 1] = "SYNC";
})(StepType || (StepType = {}));
export default class SyncModule {
  constructor(physicsPerSecond = 15) {
    this.physicsPerSecond = physicsPerSecond;
    this.scenes = [];
    this.counter = 0;
  }
  pushGOs(sceneName, sceneObjects) {
    const gameObjects = [];
    sceneObjects.forEach((go) => {
      gameObjects.push(go);
    });
    if (gameObjects.length > 0) {
      this.scenes.push({
        name: sceneName,
        gameObjects
      });
    }
  }
  update() {
    this.counter++;
    if (this.scenes.length == 0) {
      return;
    }
    this.scenes.forEach((s) => {
      s.gameObjects.filter((go) => go.isActive).forEach((go) => {
        go.updateSync(this.counter, this.physicsPerSecond);
      });
    });
  }
  clear(sceneNames) {
    this.counter = 0;
    this.scenes = this.scenes.filter((sg) => !sceneNames.some((sn) => sg.name == sn));
  }
}
//# sourceMappingURL=sync.js.map
