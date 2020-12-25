import GameObject from "../../engine/gameobjects/gameobject.js";
export default class LevelSequence extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.font = params.font || "18pt Consolas";
    this.color = params.color || "white";
    this.levelName = params.levelName;
    this.levels = Object.entries(params.levels ?? {}).map((l) => ({
      label: l[0],
      level: l[1]
    }));
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
