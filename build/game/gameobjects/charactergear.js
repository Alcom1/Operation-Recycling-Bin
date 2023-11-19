import {BOUNDARY, RING_BITSTACKB as ring, GMULTX, GMULTY, MASKS} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import Character from "./character.js";
export var GearState;
(function(GearState2) {
  GearState2[GearState2["NORMAL"] = 0] = "NORMAL";
  GearState2[GearState2["STOP"] = 1] = "STOP";
  GearState2[GearState2["WAIT"] = 2] = "WAIT";
})(GearState || (GearState = {}));
export default class CharacterGear extends Character {
  constructor() {
    super(...arguments);
    this.storedCbm = 0;
    this.isStep = false;
  }
  get isColFlor() {
    return !!(this.storedCbm & ring.flor);
  }
  get isColRoof() {
    return !!(this.storedCbm & ring.roof);
  }
  get isColFace() {
    return !!(this.storedCbm & ring.face);
  }
  get isColBack() {
    return !!(this.storedCbm & ring.back);
  }
  get isColLand() {
    return !!(this.storedCbm & ring.land);
  }
  get isColBand() {
    return !!(this.storedCbm & ring.band);
  }
  get isColHang() {
    return !!(this.storedCbm & ring.hang);
  }
  getColliders() {
    return [{
      mask: MASKS.death,
      min: this.gpos.getAdd({x: -1, y: 1 - this.height}).getMult(GMULTX, GMULTY),
      max: this.gpos.getAdd({x: 1, y: 1}).getMult(GMULTX, GMULTY),
      isSub: true
    }];
  }
  handleStepUpdate(proxs) {
    this.storedCbm = 0;
    proxs.forEach((p) => {
      if (p.y == 2) {
        this.storedCbm |= ring.flor;
      }
      if (p.y == -2) {
        this.storedCbm |= ring.roof;
      }
      if (p.x == 2) {
        this.storedCbm |= this.move.x > 0 ? ring.face : ring.back;
      }
      if (p.x == -2) {
        this.storedCbm |= this.move.x > 0 ? ring.back : ring.face;
      }
    });
    if (this.gpos.x - 2 < BOUNDARY.minx) {
      this.storedCbm |= this.move.x > 0 ? ring.back : ring.face;
    } else if (this.gpos.x + 2 > BOUNDARY.maxx) {
      this.storedCbm |= this.move.x > 0 ? ring.face : ring.back;
    }
    if (this.gpos.y - 2 < BOUNDARY.miny) {
      this.storedCbm |= ring.roof;
    }
    this.storedCbm |= this.brickHandler.checkCollisionRing(this.gpos.getAdd({
      x: -2,
      y: -this.height
    }), 4, this.move.x, true);
  }
  handleStep() {
    if (this.stateIndex == 0) {
      this.moveAll(this.move);
    }
  }
  getNoPlaceZone() {
    return [-1, 0].flatMap((x) => [-1, 0].map((y) => new Vect(x, y).getAdd(this.gpos).getAdd(this.stateIndex == 0 ? this.move : {x: 0, y: 0})));
  }
}
//# sourceMappingURL=charactergear.js.map
