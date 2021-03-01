import Vect from "../utilities/vect.js";
export var MouseState;
(function(MouseState2) {
  MouseState2[MouseState2["ISRELEASED"] = 0] = "ISRELEASED";
  MouseState2[MouseState2["WASPRESSED"] = 1] = "WASPRESSED";
  MouseState2[MouseState2["ISPRESSED"] = 2] = "ISPRESSED";
  MouseState2[MouseState2["WASRELEASED"] = 3] = "WASRELEASED";
})(MouseState || (MouseState = {}));
export default class MouseModule {
  constructor(element) {
    this.mousePos = new Vect(0, 0);
    this.mousePressed = false;
    this.afterPressed = false;
    this.resolution = new Vect(0, 0);
    this.mouseElement = element;
    this.mouseElement.onpointermove = (e) => this.updatePos(e);
    this.mouseElement.onpointerdown = (e) => {
      this.mousePressed = true;
      this.updatePos(e);
    };
    this.mouseElement.onpointerup = () => this.mousePressed = false;
    this.mouseElement.onpointercancel = () => this.mousePressed = false;
  }
  update() {
    this.afterPressed = this.mousePressed;
  }
  updatePos(e) {
    e.preventDefault();
    this.mousePos = new Vect(e.offsetX * (this.resolution.x / e.target.clientWidth), e.offsetY * (this.resolution.y / e.target.clientHeight));
  }
  getPos() {
    return this.mousePos;
  }
  getMouseState() {
    if (this.mousePressed && !this.afterPressed) {
      return 1;
    } else if (this.mousePressed) {
      return 2;
    } else if (!this.mousePressed && this.afterPressed) {
      return 3;
    } else {
      return 0;
    }
  }
  setCursorURL(url) {
    console.log(url);
    this.mouseElement.style.cursor = "url(" + url + "), auto";
  }
  setResolution(resx, resy) {
    this.resolution = new Vect(resx, resy);
  }
}
//# sourceMappingURL=mouse.js.map
