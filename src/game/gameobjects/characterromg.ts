import { bitStack, BOUNDARY } from "engine/utilities/math";
import Character, { CharacterParams } from "./character";

const characterRomGOverride = Object.freeze({
    height: 3,
    speed : 6.0,
    images : [        
        { name : "char_romg_left", offsetX : 0 },
        { name : "char_romg_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1
});

//Collision bitmasks for bot-brick collisions
const gcb = Object.freeze({
    flor : bitStack([2]),
    face : bitStack([0, 1])
});

export default class CharacterRomG extends Character {

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
                    x : this.move.x > 0 ? 0 : 1, 
                    y : this.height - 1
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
}