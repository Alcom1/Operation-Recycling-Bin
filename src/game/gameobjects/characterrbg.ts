import GameObject, { Collision } from "engine/gameobjects/gameobject";
import { Collider, Step } from "engine/modules/collision";
import { bitStack, BOUNDARY, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterRB, { gcb } from "./characterrb";

const characterRBGOverride = Object.freeze({
    height: 2,
    speed : 5.0,
    images : [        
        { name : "char_rbg_left", offsetX : 0 },
        { name : "char_rbg_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true
});

export default class CharacterRBG extends CharacterRB {

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBGOverride));
    }

    //Check and resolve brick collisions
    protected handleCollision() {

        this.isStep = true;
        this.storedCbm = 0;

        //WALL BOUNDARY
        if (this.gpos.x - 2 < BOUNDARY.minx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.back : gcb.face);
        }        
        else if (this.gpos.x + 2 > BOUNDARY.maxx) {

            this.storedCbm |= (this.move.x > 0 ? gcb.face : gcb.back);
        }

        this.storedCbm |= this.brickHandler.checkCollisionRing(
            this.gpos.getAdd({
                x : -2, 
                y : -this.height}), 
            4, 
            this.move.x);
    }

    public resolveCollisions(collisions : Collision[], step : Step) {
        
        if(this.isStep)
        {
            this.isStep = false;
            super.resolveCollisions(collisions, step);
        
            //Brick collisions
            if(this.storedCbm & gcb.face) {
                this.reverse();
            }
            //
            else if(!(this.storedCbm & gcb.flor)) {
                this.reverse();
            }

            this.gpos.x += this.move.x;
        }
    }

    //Explode
    public resolveCollision(mask : number, other : GameObject) {

        //Reverse
        if (mask & (MASKS.enemy | MASKS.block)){

            var targetDir = Math.sign(other.gpos.x - this.gpos.x)   //Direction of the target
            var facingDir = Math.sign(this.move.x);                 //Direction of this's movement

            if(targetDir == facingDir) {
                this.storedCbm |= gcb.face;
            }
        }
    }
}