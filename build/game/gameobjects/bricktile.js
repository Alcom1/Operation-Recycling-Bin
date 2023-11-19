import Brick from "./brick.js";
export default class BrickTile extends Brick {
  constructor(params) {
    super({...params, block: true});
    this.isOn = false;
    this.tags.push("BrickTile");
    this.images = params.images.map((i) => i ? this.engine.library.getImage(i) : {});
    this.isOn = params.isOn ?? true;
    this.image = this.images[+this.isOn];
    this.circuit = params.circuit;
  }
  setOnOff(state) {
    this.isOn = state;
    this.image = this.images[+this.isOn];
  }
}
//# sourceMappingURL=bricktile.js.map
