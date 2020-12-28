export default class BakerModule {
  constructor(element) {
    this.canvas = element;
    const ctx = this.canvas.getContext("2d");
    if (!ctx)
      throw new Error("Unable to acquire canvas rendering context");
    this.ctx = ctx;
    this.images = {};
  }
  bake(render, width, height, tag) {
    if (tag && this.images[tag]) {
      return this.images[tag];
    }
    const canvasSize = {
      width: this.canvas.width,
      height: this.canvas.height
    };
    this.canvas.width = width || this.canvas.width;
    this.canvas.height = height || this.canvas.height;
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    render(this.ctx);
    const data = this.canvas.toDataURL();
    if (tag) {
      this.images[tag] = data;
    }
    this.ctx.restore();
    this.canvas.width = canvasSize.width;
    this.canvas.height = canvasSize.height;
    return data;
  }
}
//# sourceMappingURL=baker.js.map
