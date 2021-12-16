import GameObject from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, GMULTX, GMULTY } from "engine/utilities/math";
import Character, { CharacterParams } from "./character";

const characterRomGOverride = Object.freeze({
    height: 2,
    speed : 6.0,
    images : [        
        { name : "char_romg_left", offsetX : 0 },
        { name : "char_romg_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true
});

//Collision bitmasks for bot-brick collisions
const gcb = Object.freeze({
    flor : bitStack([2]),
    face : bitStack([0, 1])
});

export default class CharacterRBG extends Character {

    private other! : GameObject;

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRomGOverride));
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

            //Collision bitmask
            const cbm = this.brickHandler.checkCollisionRange(
                this.gpos.getSub({
                    x : this.move.x > 0 ? -1 : 2, 
                    y : this.height
                }),             //Position
                this.move.x,    //Direction
                0,              //START :  n + 1
                3,              //FINAL : (n + 3) * 2 + 1
                3);             //HEIGHT:  n + 3

            //
            if(cbm & gcb.face) {
                this.reverse();
            }
            //
            else if(cbm !& gcb.flor) {

            }
            //VOID - REVERSE
            else {
                this.reverse();
            }
        }
    }

    //Get bin colliders
    public getColliders() : Collider[] {

        return [{ 
            mask : 0b100000100,
            min : this.gpos
                .getAdd({ x : -1, y : 1 - this.height})
                .getMult(GMULTX, GMULTY)
                .getAdd(this.spos)
                .getAdd({x : 18, y : 0}),
            max : this.gpos
                .getAdd({ x :  1, y : 1})
                .getMult(GMULTX, GMULTY)
                .getAdd(this.spos),
            isSub : true
        },{ 
            mask : 0,   //Passive
            min : this.gpos.getAdd({ x : -1, y : 1 - this.height}),
            max : this.gpos.getAdd({ x :  1, y : 1}) 
        }];
    }

    //Explode
    public resolveCollision(mask : number, other : GameObject) {

        //Reverse
        if (mask & 0b100000000){

            var targetDir = Math.sign(other.gpos.x - this.gpos.x)   //Direction of the target
            var facingDir = Math.sign(this.move.x);                 //Direction of this's movement  

            if(targetDir == facingDir) {
                this.reverse();
            }
        }
    }
}