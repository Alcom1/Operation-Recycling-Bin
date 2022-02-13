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
        speed : 2.0,
        images : [{ name : "char_rbg_left" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    },{
        speed : 2.0,
        images : [{ name : "char_rbg_right" }],
        frameCount : 2,
        gposOffset : { x : -1, y : 0},
        isSliced : true
    }]
});

//Collision bitmasks
const gcb = Object.freeze({
    flor : bitStack([3, 7]),
    face : bitStack([9, 10]),
    ceil : bitStack([0, 4])
});

export default class CharacterRBC extends CharacterRB {

    private vertSpeed : number = 50; 
    private ground: number = 0;
    private climbLimit: number = 3;

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

    //Collisions for normal movement
    protected handleCollisionNormal() {
        
        //WALL BOUNDARY
        if (this.gpos.x - 1 < BOUNDARY.minx || 
            this.gpos.x > BOUNDARY.maxx) {

            this.reverse();
        }
        //Brick collisions
        else {

            //Collision bitmask
            const cbm = this.getCollisionBitMask()
            
            //If there is no floor, start going down.
            if(!(cbm & gcb.flor)) {
                this.setStateIndex(2);
            }
            //Otherwise if there is a wall, try going above it.
            else if((cbm & gcb.face)) {

                //If there is a ceiling blocking the ascent, reverse.
                if(cbm & gcb.ceil) {
                    this.reverse();
                }
                //Otherwise, go up.
                else {
                    this.setStateIndex(1);
                }
            }
        }
    }

    //Collisions for downward movement
    protected handleCollisionUp() {

        //Collision bitmask
        const cbm = this.getCollisionBitMask();

        //If there is no longer a wall blocking, move forward.
        if(!(cbm & gcb.face)) {
            this.setStateIndex(0);
        }
        //Otherwise if the climbing limit is reached, start moving back down.
        else if(cbm & gcb.ceil || this.ground - this.gpos.y >= this.climbLimit) {            
            this.setStateIndex(2);
        }
    }

    //Collisions for upward movement
    protected handleCollisionDown() {

        //Collision bitmask
        const cbm = this.getCollisionBitMask()

        //If there is a floor, land.
        if(cbm & gcb.flor) {

            //If there is a wall in the way while landing, turn around
            if(cbm & gcb.face) {
                this.setStateIndex(0);
                this.reverse();
            }
            //Oterwise, continue forward
            else {
                this.setStateIndex(0);
            }
        }
    }

    //Get collision bitmask shared by all collisions here
    private getCollisionBitMask() : number {

        return this.brickHandler.checkCollisionRange(
            this.gpos.getSub({
                x : this.move.x > 0 ? 1 : 0, 
                y : this.height + 1
            }),             //Position
            this.move.x,    //Direction
            0,              //START :  n + 1
            11,             //FINAL : (n + 3) * 2 + 1
            4,              //HEIGHT:  n + 3
            3);             
    }

    //Set current & active group based on the group index
    protected setStateIndex(index? : number) {

        //Store the current ground position if we're starting to go up.
        if(index == 1) {
            this.ground = this.gpos.y;
        }

        super.setStateIndex(index);
    }

    //Resolve collisions
    public resolveCollision(mask : number, other : GameObject) {

        //Reverse
        if (mask & (MASKS.enemy | MASKS.block)){

            var targetDir = Math.sign(other.gpos.x - this.gpos.x)   //Direction of the target
            var facingDir = Math.sign(this.move.x);                 //Direction of this's movement  

            switch(this.stateIndex) {
                case ClimbState.NORMAL :
                    //If there's a horizontal collision, reverse.
                    if(targetDir == facingDir && other.gpos.y >= this.gpos.y - this.height) {
                        this.reverse();
                    }
                    break;

                case ClimbState.UP : break;
                case ClimbState.DOWN : 

                    //If there's a collision below, mover horizontally
                    if(other.gpos.y > this.gpos.y) {
                        this.setStateIndex(0);
                    }
                    break;
            }
        }
    }
}