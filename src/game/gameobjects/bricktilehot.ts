import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import Anim, { AnimationParams } from "./anim";
import BrickTile, { BrickTileParams } from "./bricktile";
import BrickTileAnim from "./bricktileanim";

/** Specifications of a hot tile */
const BrickTileHotOverride = Object.freeze({
    images : [["brick_tile_hot_off", "svg"]],
    width : 4,
    animName : "brick_tile_hot",
    animExtension : "svg",
    animSpeed : 2,
    animFrameCount : 7
});

/** A tile with a HOT effect */
export default class BrickTileHot extends BrickTileAnim {

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, BrickTileHotOverride));
    }

    /** Get hazard and passive colliders of this brick. */
    public getColliders() : Collider[] {

        // Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? [{// Only return hazard hitbox if this plate is on.
            mask : MASKS.death,
            min : this.gpos.getAdd({ x : 1,              y : -1}),
            max : this.gpos.getAdd({ x : this.width - 1, y :  0}) 
        }] : []);
    }
}