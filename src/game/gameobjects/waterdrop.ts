import { GameObjectParams } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { BOUNDARY, GMULTY } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import Animat, { AnimationParams } from "./animation";
import BrickHandler from "./brickhandler";
import Sprite from "./sprite";

//Water drop params
const characterBotOverride = Object.freeze({
    image: "part_water",
    zIndex: 0,
});

/** Single image gameobject */
export default class WaterDrop extends Sprite {

    private speed : number = 500;
    private brickHandler! : BrickHandler;
    private animLand: Animat;

    constructor(params: GameObjectParams) {
        super(Object.assign(params, characterBotOverride));

        this.animLand = this.parent.pushGO(new Animat({
            ...params,
            zModifier : 100,
            images : [{ name : "part_water_land" }],
            speed : 2.5,
            frameCount : 6,
            isVert : true,
            isActive : false,
            isLoop : false
        } as AnimationParams)) as Animat;

        this.isActive = false;  //Start deactivated
    }

    //Get brick handler for brick collisions
    public init() {

        //Get brick handler to to check brick-wind collisions
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;
    }

    //Move waterdrop down.
    public update(dt : number) {
        this.spos.y += dt * this.speed;

        if(this.spos.y > GMULTY) {
            this.spos.y -= GMULTY;
            this.gpos.y += 1;

            //Collide with lower boundary or bricks
            if (this.gpos.y > BOUNDARY.maxy || 
                this.brickHandler.checkCollisionRange(
                this.gpos,  //Position
                0,          //START
                2,          //FINAL
                1,          //HEIGHT
                1)) {       //Direction

                this.doLandAnimation();
            } 
        }
    }

    //Reset and spawn this waterdrop.
    public reset(gpos : Vect) {

        this.isActive = true;
        this.gpos = gpos.get();
        this.spos = { x : 0, y : 0 } as Vect;
    }

    //Remove this waterdrop upon collision
    public resolveCollision() {
        this.doLandAnimation();
    }

    //Perform a waterdrop landing animation
    private doLandAnimation() {
        this.isActive = false;
        this.animLand.isActive = true;
        this.animLand.reset(this.gpos);
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Return hazard hitbox
        return [{
            mask : 0b100100,   //Hazard & other
            min : this.gpos,
            max : this.gpos.getAdd({ x : 2, y :  1}) 
        }];
    }
}