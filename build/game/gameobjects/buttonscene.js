import Button from "./button.js";
export default class ButtonScene extends Button {
  constructor() {
    super(...arguments);
    this.sceneName = null;
  }
  init(ctx, scenes) {
    super.init(ctx, scenes);
    const levelSequence = this.engine.tag.get("LevelSequence", "Level")[0];
    if (levelSequence) {
      this.sceneName = levelSequence.levels.find((l) => l.label === this.text.split(" ").join(""))?.level ?? null;
    }
  }
  doButtonAction() {
    if (this.sceneName) {
      this.engine.killAllScenes();
      this.engine.pushScenes(this.sceneName);
      this.engine.pushScenes("level_interface");
    }
  }
}
//# sourceMappingURL=buttonscene.js.map
