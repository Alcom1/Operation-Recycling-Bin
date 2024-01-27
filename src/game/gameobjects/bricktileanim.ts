import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import Anim, { AnimationParams } from "./anim";
import BrickTile, { BrickTileParams } from "./bricktile";

/** Parameters for a tile */
export interface BrickTileAnimParams extends BrickTileParams {
    animName : string;
    animExtension : string;
    animFrameCount : number;
    animSpeed : number;
}

/** A tile with a HOT effect */
export default class BrickTileAnim extends BrickTile {

    private animation: Anim;    // Tile is animated

    /** z-index get/setters */
    get zIndex() : number { return super.zIndex; }
    set zIndex(value : number) { 
        super.zIndex = value; 
        this.animation.zIndex = value;
    }

    /** Constructor */
    constructor(params: BrickTileAnimParams) {
        super(params);

        //Animation for tile while on
        this.animation = this.parent.pushGO(new Anim({
            ...params,
            subPosition : { x : 0, y : -25 },   // For some reason, this animation appears super low by default.
            images : [{                         // Single animation image 
                name : params.animName,
                extension : params.animExtension
            }],
            speed : params.animSpeed,
            frameCount : params.animFrameCount,
            isVert : true                       // Animation frames are stacked vertically
        } as AnimationParams)) as Anim;

        this.animation.isActive == this.isOn;   // Animation only applies to active hot tiles
    }
    
    /** draw off tile */
    public draw(ctx : CanvasRenderingContext2D) {

        if (!this.isOn) {       // Tile is off
            super.draw(ctx);    // Draw the off tile instead of the animation
        }
    }

    /** Set on/off state and animation to match */
    public setOnOff(state : boolean) {
        super.setOnOff(state);

        this.animation.isActive = state;
    }
}