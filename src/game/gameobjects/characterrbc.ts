import GameObject from "engine/gameobjects/gameobject";
import { Collider } from "engine/modules/collision";
import { bitStack, BOUNDARY, GMULTX, GMULTY, MASKS } from "engine/utilities/math";
import { CharacterParams } from "./character";
import CharacterRB from "./characterrb";

enum ClimbState {
    NORMAL,
    UP,
    DOWN
}

const characterRBCOverride = Object.freeze({
    height: 2,
    speed : 2.0,
    images : [        
        { name : "char_rbg_left", offsetX : 0 },
        { name : "char_rbg_right", offsetX : 0}],
    frameCount : 2,
    animsCount : 1,
    isGlide : true,
    
    //Misc animation parameters
    animsMisc : [{
        images : [{ name : "char_rbg_left" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        images : [{ name : "char_rbg_right" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    }]
});

//Collision bitmasks for normal collisions
const ncb = Object.freeze({
    flor : bitStack([0, 3]),
    face : bitStack([4, 5])
});

//Collision bitmasks for normal collisions
const dcb = Object.freeze({
    flor : bitStack([0, 1]),
});

export default class CharacterRBC extends CharacterRB {

    private vertSpeed : number = 50; 

    constructor(params: CharacterParams) {
        super(Object.assign(params, characterRBCOverride));
    }

    public update(dt: number) {
        super.update(dt);
    }

    public handleSpecialMovement(dt : number) {
        
        switch(this.stateIndex) {

            case ClimbState.UP :
                this.spos.y -= this.vertSpeed * dt;
                break;

            case ClimbState.DOWN :
                this.spos.y += this.vertSpeed * dt;
                break;
        }

        this.animationsCurr.forEach(a => {
            a.spos = this.spos;
        });
    }

    //Check and resolve brick collisions
    protected handleCollision() {        
        
        
        switch(this.stateIndex) {

            case ClimbState.NORMAL :
                this.handleCollisionNormal();
                break;

            case ClimbState.UP :
                this.handleCollisionUp();
                break;

            case ClimbState.DOWN :
                this.handleCollisionDown();
                break;
        }
    }

    //
    protected handleCollisionNormal() {
        
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
                    x : this.move.x > 0 ? 1 : 0, 
                    y : this.height
                }),             //Position
                this.move.x,    //Direction
                2,              //START :  n + 1
                9,              //FINAL : (n + 3) * 2 + 1
                3,              //HEIGHT:  n + 3
                3);             
            
            //
            if(cbm & ncb.face) {
                this.setStateIndex(1);
            }
            else if(!(cbm & ncb.flor)) {
                this.setStateIndex(2);
            }
        }
    }

    //
    protected handleCollisionUp() {
        
    }

    //
    protected handleCollisionDown() {

        //Collision bitmask
        const cbm = this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : this.move.x > 0 ? 1 : 0, 
                y : 0
            }),             //Position
            this.move.x,    //Direction
            0,              //START :  n + 1
            2,              //FINAL : (n + 3) * 2 + 1
            1);             //HEIGHT:  n + 3

        if(cbm & dcb.flor) {
            this.setStateIndex(0);
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