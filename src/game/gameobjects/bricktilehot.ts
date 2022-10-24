import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import Anim, { AnimationParams } from "./anim";
import BrickTile, { BrickTileParams } from "./bricktile";

/** Specifications of a hot tile */
const BrickTileHotOverride = Object.freeze({
    images : ["brick_tile", "brick_tile_hot"],
    width : 4
});

/** A tile with a HOT effect */
export default class BrickTileHot extends BrickTile {

    private animation: Anim;    // Tile is animated

    /** Constructor */
    constructor(params: BrickTileParams) {
        super(Object.assign(params, BrickTileHotOverride));

        this.animation = this.parent.pushGO(new Anim({
            ...params,
            subPosition : { x : 0, y : -25 },       // For some reason, this animation appears super low by default.
            zModifier : 40,                         // Z-index modifier of a 4-width brick
            images : [{ name : "brick_tile_hot" }], // Single hotplate animation image
            speed : 2,                              // Hotplate animation is weirdly fast
            frameCount : 7,
            isVert : true                           // Hotplate animation frames are stacked vertically
        } as AnimationParams)) as Anim;

        this.animation.isActive == this.isOn;       // Animation only applies to active hot tiles
    }
    
    /** draw off tile */
    public draw(ctx : CanvasRenderingContext2D) {

        if (!this.isOn) {       // Tile is off
            super.draw(ctx);    // Draw the off tile instead of the animation
        }
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