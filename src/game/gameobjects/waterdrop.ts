import { GameObjectParams } from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { BOUNDARY, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import Anim, { AnimationParams } from "./anim";
import BrickHandler from "./brickhandler";
import Sprite from "./sprite";

/** Specifications of a water drop */
const waterDropOverride = Object.freeze({
    image: "part_water",
    zIndex: 0,
});

/** Single image gameobject */
export default class WaterDrop extends Sprite {
    private speed : number = 500;
    private brickHandler! : BrickHandler;
    private animLand: Anim;
    private animSlip: Anim;
    private slipDuration : number = 0.4;
    private slipTimer: number = 0;

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(Object.assign(params, waterDropOverride));

        this.zIndex = 2500; //Big Z-index, should be in front of everything

        this.animLand = this.parent.pushGO(new Anim({
            ...params,
            zIndex : this.zIndex,
            images : [{ name : "part_water_land" }],
            speed : 2.5,
            frameCount : 6,
            isVert : true,
            isActive : false,
            isLoop : false
        } as AnimationParams)) as Anim;

        this.animSlip = this.parent.pushGO(new Anim({
            ...params,
            zIndex : this.zIndex,
            images : [{ name : "part_water_slip" }],
            speed : 1 / this.slipDuration,
            frameCount : 6,
            isVert : true,
            isActive : false,
            isLoop : false
        } as AnimationParams)) as Anim;

        this.isActive = false;  // Start deactivated
    }

    /** Get brick handler for brick collisions */
    public init() {

        // Get brick handler to to check brick-wind collisions
        this.brickHandler = this.engine.tag.get(
            "BrickHandler", 
            "LevelInterface")[0] as BrickHandler;
    }

    /** Move waterdrop down. */
    public update(dt : number) {

        if (this.slipTimer < this.slipDuration) {
            this.slipTimer += dt;
            return;
        }
        else {
            this.animSlip.isActive = false;
        }

        this.spos.y += dt * this.speed;

        if (this.spos.y > GMULTY) {
            this.spos.y -= GMULTY;
            this.gpos.y += 1;

            // Collide with lower boundary or bricks
            if (this.gpos.y > BOUNDARY.maxy || 
                this.brickHandler.checkCollisionRange(
                this.gpos,  // Position
                1,          // Direction
                0,          // START
                2,          // FINAL
                1))         // HEIGHT
                {
                      

                this.doLandAnimation();
            } 
        }
    }

    /** Draw only after slip animation ends */
    public draw(ctx : CanvasRenderingContext2D) {
        if (this.slipTimer >= this.slipDuration) {
            super.draw(ctx);
        }
    }

    /** Reset and spawn this waterdrop. */
    public reset(gpos : Vect) {

        this.isActive = true;
        this.gpos = gpos.get();
        this.spos.setToZero();
        this.slipTimer = 0;
        this.animSlip.isActive = true;
        this.animSlip.reset(this.gpos);
    }

    /** Remove this waterdrop upon collision */
    public resolveCollision() {
        this.doLandAnimation();
    }

    /** Perform a waterdrop landing animation */
    private doLandAnimation() {

        this.isActive = false;
        this.animLand.isActive = true;
        this.animLand.reset(this.gpos);
    }

    /** Get hazard and passive colliders of this brick. */
    public getColliders() : Collider[] {

        // Return hazard hitbox
        return [{
            mask : MASKS.water | MASKS.death,
            min : this.gpos,
            max : this.gpos.getAdd({ x : 2, y :  1}) 
        }];
    }
}