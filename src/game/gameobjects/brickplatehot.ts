import { Collider } from "engine/modules/collision";
import { MASKS } from "engine/utilities/math";
import Anim, { AnimationParams } from "./anim";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickPlateHotOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_hot"],
    width : 4
});

export default class BrickPlateHot extends BrickPlate {

    private animation: Anim;

    /** Constructor */
    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickPlateHotOverride));

        this.animation = this.parent.pushGO(new Anim({
            ...params,
            subPosition : { x : 0, y : -25 },                       //For some reason, this animation appears super low by default.
            zModifier : 40,                                         //Z-index modifier of a 4-width brick
            images : [{ name : "brick_plate_hot" }],   //Single hotplate animation image
            speed : 2,                                              //Hotplate animation is weirdly fast
            frameCount : 7,
            isVert : true                                           //Hotplate animation frames are stacked vertically
        } as AnimationParams)) as Anim;

        this.animation.isActive == this.isOn;
    }
    
    //draw nothing
    public draw(ctx : CanvasRenderingContext2D) {
        if (!this.isOn) {
            super.draw(ctx);
        }
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? [{//Only return hazard hitbox if this plate is on.
            mask : MASKS.death,
            min : this.gpos.getAdd({ x : 1,              y : -1}),
            max : this.gpos.getAdd({ x : this.width - 1, y :  0}) 
        }] : []);
    }
}