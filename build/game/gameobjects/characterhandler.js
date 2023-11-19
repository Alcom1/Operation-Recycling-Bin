import GameObject from "../../engine/gameobjects/gameobject.js";
export default class CharacterHandler extends GameObject {
  constructor() {
    super(...arguments);
    this.characters = [];
    this.isStart = false;
  }
  init() {
    this.characters = this.engine.tag.get("Character", "Level");
  }
  update() {
    if (!this.isStart) {
      this.isStart = true;
      let charactersTagged = this.characters;
      charactersTagged.sort((a, b) => a.gpos.x - b.gpos.x || a.gpos.y - b.gpos.y);
      this.handleStepUpdate(charactersTagged, 0, 0, true);
    }
  }
  getNoPlaceZones() {
    return this.characters.flatMap((x) => x.getNoPlaceZone());
  }
  updateSync(counter, loopLength) {
    let charactersTagged = this.characters;
    charactersTagged.sort((a, b) => a.gpos.x - b.gpos.x || b.gpos.y - a.gpos.y);
    charactersTagged.forEach((ct) => {
      if (counter % (loopLength / ct.speed) == 0) {
        ct.handleStep();
      }
    });
    this.handleStepUpdate(charactersTagged, counter, loopLength);
  }
  handleStepUpdate(charactersTagged, counter, loopLength, isOverride = false) {
    charactersTagged.forEach((ct1, i) => {
      if (isOverride || counter % (loopLength / ct1.speed) == 0) {
        let proxs = [];
        charactersTagged.slice(0, i).filter((ct2) => ct2.height == 2).forEach((ct2) => {
          let diff = ct2.gpos.getSub(ct1.gpos);
          if (Math.abs(diff.x) <= 3 && Math.abs(diff.y) <= 3) {
            proxs.push(diff.getAdd({
              x: ct2.move.y == 0 ? ct2.move.x : 0,
              y: ct2.move.y
            }));
          }
        });
        ct1.handleStepUpdate(proxs);
      }
    });
  }
}
//# sourceMappingURL=characterhandler.js.map
