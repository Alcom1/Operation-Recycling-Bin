import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import Animat, { AnimationParams } from "./animation";
import BrickPlate, { BrickPlateParams } from "./brickplate";

const brickPlateHotOverride = Object.freeze({
    images : ["brick_plate", "brick_plate_hot"],
    width : 4
});

export default class BrickPlateHot extends BrickPlate {

    private animation: Animat;

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, brickPlateHotOverride));

        //this.parent.pushGO(
        this.animation = this.parent.pushGO(new Animat(this.engine, {
            ...params,
            subPosition : { x : 0, y : -25 },                       //For some reason, this animation appears super low by default.
            zModifier : 40,                                         //Z-index modifier of a 4-width brick
            images : [{ name : "brick_plate_hot", offsetX : 0 }],   //Single hotplate animation image
            speed : 2,                                              //Hotplate animation is weirdly fast
            framesSize : 55,
            frameCount : 7,
            isVert : true                                           //Hotplate animation frames are stacked vertically
        } as AnimationParams)) as Animat;

        this.animation.isActive == this.isOn;
    }
    
    //draw nothing
    public draw(ctx : CanvasRenderingContext2D) {
        if(!this.isOn) {
            super.draw(ctx);
        }
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class
        return super.getColliders().concat(this.isOn ? [{//Only return hazard hitbox if this plate is on.
            mask : 0b100,           //Hazard
            min : this.gpos.getAdd({ x : 1,              y : -1}),
            max : this.gpos.getAdd({ x : this.width - 1, y :  0}) 
        }] : []);
    }
}