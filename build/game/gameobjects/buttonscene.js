import Button from "./button.js";
export default class ButtonScene extends Button {
  constructor() {
    super(...arguments);
    this.sceneName = null;
  }
  init(ctx) {
    super.init(ctx);
    const levelSequence = this.engine.tag.get("LevelSequence", "Level")[0];
    if (levelSequence) {
      this.sceneName = levelSequence.levels.find((l) => l.label.toLowerCase() === this.text.split(" ").join("").toLowerCase())?.level ?? null;
    }
  }
  doButtonAction() {
    if (this.sceneName) {
      this.engine.killAllScenes();
      this.engine.pushScenes(this.sceneName);
      this.engine.pushScenes("LevelInterface");
    }
  }
}
//# sourceMappingURL=buttonscene.js.map
