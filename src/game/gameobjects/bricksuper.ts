import { Collider } from "engine/modules/collision";
import { getZIndex } from "engine/utilities/math";
import BrickPlate, { BrickPlateParams } from "./brickplate";
import Sprite, { SpriteParams } from "./sprite";

const brickSuperOverride = Object.freeze({
    images : ["brick_super_off", "brick_super"],
    width : 2,
    isOn : true
});

export default class BrickSuper extends BrickPlate {

    private topSprite : Sprite;

    constructor(params: BrickPlateParams) {
        super(Object.assign(params, brickSuperOverride));

        var topGPos = this.gpos.getAdd({x : 0, y : -1})

        this.topSprite = this.parent.pushGO(
            new Sprite({
                    ...params,
                    position : topGPos,
                    zIndex : getZIndex(topGPos, -1),
                    image : "brick_super_top"
                } as SpriteParams)) as Sprite
    }

    //Get hazard and passive colliders of this brick.
    public getColliders() : Collider[] {

        //Combine with passive collider from base class, only return jump hitbox if this plate is on and not selected
        return super.getColliders().concat(this.isOn && !this.isSelected ? [{
            mask : 0b10000,           //Super
            min : this.gpos.getAdd({ x : 0,          y : -1}),
            max : this.gpos.getAdd({ x : this.width, y :  0}) 
        }] : []);
    }

    //Explode
    public resolveCollision(mask : number) {

        //Turn off
        if (mask & 0b10000) {
            this.isOn = false;
            this.image = this.images[+this.isOn];
            this.topSprite.isActive = false;
        }
    }
}
