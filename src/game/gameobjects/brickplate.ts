import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import Animat, { AnimationParams } from "./animation";
import Brick from "./brick";

export default class BrickPlate extends Brick {

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, {...params, ...{ width : 4 }});

        this.image = this.engine.library.getImage("brick_plate");

        //this.parent.pushGO(
        this.parent.pushGO(new Animat(this.engine, {
            ...params,
            subPosition : { x : 0, y : -25 },                       //For some reason, this animation appears super low by default.
            zModifier : 40,                                         //Z-index modifier of a 4-width brick
            images : [{ name : "brick_plate_hot", offsetX : 0 }],   //Single hotplate animation image
            speed : 2,                                              //Hotplate animation is weirdly fast
            framesSize : 55,
            frameCount : 7,
            isVert : true                                           //Hotplate animation frames are stacked vertically
        } as AnimationParams));
    }
    
    //draw nothing
    public draw() {
        
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {
        return [{ 
            mask : 0b100,   //Hazard
            min : this.gpos.getAdd({ x : 1,              y : -1}),
            max : this.gpos.getAdd({ x : this.width - 1, y :  0}) 
        },{ 
            mask : 0,       //Passive
            min : this.gpos.getAdd({ x : 0,              y : -1}),
            max : this.gpos.getAdd({ x : this.width,     y :  2}) 
        }];
    }
}