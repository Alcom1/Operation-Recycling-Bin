import GameObject from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterRB from "./characterrb";

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

//Collision bitmasks for bot-brick collisions
const gcb = Object.freeze({
    flor : bitStack([11]),
    face : bitStack([5, 7])
});

export default class CharacterRBG extends CharacterRB {

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBGOverride));
    }

    //Check and resolve brick collisions
    protected handleCollision() {
    
        //WALL BOUNDARY
        if (this.gpos.x - 1 < BOUNDARY.minx || 
            this.gpos.x + 1 > BOUNDARY.maxx) {

            this.reverse();
        }
        //Brick collisions
        else {

            const cbm = this.brickHandler.checkCollisionRing(
                this.gpos.getAdd({
                    x : -2, 
                    y : -this.height}), 
                4, 
                this.move.x);

            //
            if(cbm & gcb.face) {
                this.reverse();
            }
            //
            else if(!(cbm & gcb.flor)) {
                this.reverse();
            }
            //
            else {
                this.gpos.x += this.move.x;
            }
        }
    }

    //Explode
    public resolveCollision(mask : number, other : GameObject) {

        //Reverse
        if (mask & (MASKS.enemy | MASKS.block)){

            var targetDir = Math.sign(other.gpos.x - this.gpos.x)   //Direction of the target
            var facingDir = Math.sign(this.move.x);                 //Direction of this's movement  

            if(targetDir == facingDir) {
                this.reverse();
            }
        }
    }
}