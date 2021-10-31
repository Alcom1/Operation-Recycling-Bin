import ZGameObject from "./zgameobject.js";
export default class LevelSequence extends ZGameObject {
  constructor(params) {
    super(params);
    this.font = params.font || "24px Font04b_08";
    this.color = params.color || "white";
    this.levelName = params.levelName;
    this.levels = Object.entries(params.levels ?? {}).map((l) => ({
      label: l[0],
      level: l[1]
    }));
    this.par = params.par;
  }
  draw(ctx) {
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(this.levelName, 0, 1);
  }
}
//# sourceMappingURL=levelsequence.js.map
