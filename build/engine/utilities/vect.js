function isPoint(vect) {
  return vect.x !== void 0 && vect.y !== void 0;
}
export default class Vect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get() {
    return new Vect(this.x, this.y);
  }
  set(a, b) {
    if (isPoint(a)) {
      this.x = a.x;
      this.y = a.y;
    } else {
      if (b === void 0)
        throw new Error("Vector y can't be undefined");
      this.x = a;
      this.y = b;
    }
  }
  getDiff(vect) {
    return vect.x != this.x || vect.y != this.y;
  }
  getLessOrEqual(vect) {
    return vect.x <= this.x && vect.y <= this.y;
  }
  add(vect) {
    this.x += vect.x;
    this.y += vect.y;
  }
  getAdd(vect) {
    return new Vect(this.x + vect.x, this.y + vect.y);
  }
  sub(vect) {
    this.x -= vect.x;
    this.y -= vect.y;
  }
  getSub(vect) {
    return new Vect(this.x - vect.x, this.y - vect.y);
  }
  mult(value, valueY) {
    this.x *= value;
    this.y *= valueY == null ? value : valueY;
  }
  getMult(value, valueY) {
    return new Vect(this.x * value, this.y * (valueY == null ? value : valueY));
  }
  div(value, valueY) {
    this.x /= value;
    this.y /= valueY == null ? value : valueY;
  }
  getDiv(value, valueY) {
    return new Vect(this.x / value, this.y / (valueY == null ? value : valueY));
  }
  clamp(min, max) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
  }
  getClamp(min, max) {
    return new Vect(Math.max(min.x, Math.min(max.x, this.x)), Math.max(min.y, Math.min(max.y, this.y)));
  }
  getDot(value) {
    return this.x * value.x + this.y * value.y;
  }
  getCross(value) {
    return this.x * value.y - this.y * value.x;
  }
  norm() {
    var length = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= length;
    this.y /= length;
  }
  getNorm() {
    var length = Math.sqrt(this.x * this.x + this.y * this.y);
    return new Vect(this.x / length, this.y / length);
  }
  getMagnitude() {
    return Math.sqrt(this.getMagnitudeSquared());
  }
  getMagnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }
  setToZero() {
    this.x = 0;
    this.y = 0;
  }
}
//# sourceMappingURL=vect.js.map
