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
            subPosition : { x : 0, y : -6 },
            zIndex : this.zIndex,
            images : [{ name : "brick_plate_hot_h", offsetX : 0 }],
            speed : 2,
            framesSize : 142, //55,
            frameCount : 7
        } as AnimationParams));
    }

    public draw() {
        //draw nothing
    }

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