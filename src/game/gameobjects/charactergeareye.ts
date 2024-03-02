import { col1D, Faction } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Character, { CharacterParams } from "./character";
import CharacterGear, { GearState } from "./charactergear";

/** Specifications of a grounded gearbot */
const CharacterGearEyeOverride = Object.freeze({
    height: 2,
    speed : 5.0,
    animMain : {
        images : [
            { name : "char_rbe", extension : "svg", offsetX : 0 },
            { name : "char_rbe_rage", extension : "svg", offsetX : 0 }],
        frameCount : 2,
        animsCount : 1
    },
    isGlide : true,
    animsMisc : [{
        speed : 6.0,
        images : [
            { name : "char_rbe", extension : "svg", offsetX : 0 },
            { name : "char_rbe_rage", extension : "svg", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -3, y : 0}
    },{
        speed : 6.0,
        images : [
            { name : "char_rbe", extension : "svg", offsetX : 0 },
            { name : "char_rbe_rage", extension : "svg", offsetX : 0 }],
        frameCount : 2,
        gposOffset : { x : -3, y : 0}
    }]
});

/**A normal grounded gearbot */
export default class CharacterGearEye extends CharacterGear {

    private target : Character | null = null;
    private isRage = false;

    //
    protected get animationSubindex() : number {
        return this.isRage ? 1 : -1;
    }

    /** Constructor */
    constructor(params: CharacterParams) {
        super(Object.assign(params, CharacterGearEyeOverride));
    }

    public init() {
        super.init();
        
        this.target = this.engine.tag.get(
            "CharacterBot", 
            "Level")[0] as Character;
    }

    /** Update position */
    public handleStep() {

        // Don't update position for special states (WAIT, STOP, etc)
        if(this._stateIndex != GearState.NORMAL) {
            return;
        }

        // Move in different directions based on state
        switch(this.move.y) {

            // Move forward, please.
            case 0 : 
                this.moveAll({x : this.move.x, y : 0});
                break;

            // Move down
            case 1 : 
                this.moveAll({x : 0, y : 1});
                break;

            // Move up
            case -1 : 
                this.moveAll({x : 0, y : -1});
                break;
        }
    }    
 
    /** */
    public handleStepUpdate(proxs : Point[]) {
        super.handleStepUpdate(proxs);

        let seek = Vect.zero;

        //Seek active target
        if(this.target?.isActive) {

            //Two seek columns, one seek row
            [0,-1].forEach(o => {
    
                //Vertical check if horizontally aligned
                if(Math.abs(this.gpos.x - this.target!.gpos.x) <= 1) {
        
                    let distance = this.target!.gpos.y - this.gpos.y;
                
                    //Down check
                    if(distance > 0 && this.move.y <= 0) {
    
                        let down = this.brickHandler.checkCollisionBox(
                            this.gpos.getAdd({ x : o, y : 1}),
                            this.gpos.getAdd({ x : o, y : distance}),
                            this.faction);
        
                        if(down == 0) {
                            seek.y = 1;
                            return;
                        }
                    }
                    //Up check
                    if(distance < 0 && this.move.y >= 0) {
                
                        let up = this.brickHandler.checkCollisionBox({ 
                                x : this.gpos.x + o,
                                y : this.target!.gpos.y + 1
                            },{ 
                                x : this.gpos.x + o,
                                y : this.target!.gpos.y - distance - this.height
                            },
                            this.faction);
        
                        if(up == 0) {
                            seek.y = -1;
                            return;
                        }
                    }
                }
                //Horizontal check if vertically aligned
                else if(
                    o == 0 &&   //Only one seek row
                    col1D(
                        this.gpos.y - this.height,
                        this.gpos.y,
                        this.target!.gpos.y - this.target!.height,
                        this.target!.gpos.y)) {
        
                    let distance = this.target!.gpos.x - this.gpos.x;
                    
                    //Right check
                    if(distance > 0 && (this.move.x < 0 || this.move.y != 0)) {

                        let right = this.brickHandler.checkCollisionBox(
                            this.gpos.getAdd({ x : 1,               y : 0}),
                            this.gpos.getAdd({ x : distance - 2,    y : 0}),
                            this.faction);
        
                        if(right == 0) {
                            seek.x = 1;
                            return;
                        }
                    }
                    //Left check
                    if(distance < 0 && (this.move.x > 0 || this.move.y != 0)) {
                
                        let left = this.brickHandler.checkCollisionBox({ 
                            x : this.target!.gpos.x + 1,
                            y : this.gpos.y
                        },{                             
                            x : this.target!.gpos.x - distance - 2,
                            y : this.gpos.y
                        },
                        this.faction);
        
                        if(left == 0) {

                            debugger;
                            seek.x = -1;
                            return;
                        }
                    }
                }
            });
        }

        //Seek overrides collision check
        if(seek.x || seek.y) {

            if(seek.x) {
                this.move.y = 0;
                this.move.x = seek.x;
            }
            else if(seek.y) {
                this.move.y = seek.y;
            }
            this.isRage = true;
        }
        //Collision check
        else {

            switch(this._stateIndex) {
    
                case GearState.NORMAL :
                    switch(this.move.y) {

                        // Moving horizontal
                        case 0 : 
                            if (this.isColFace) {
                                if (this.isColBack) {
                                    this.setStateIndex(GearState.STOP);
                                }
                                else {
                                    this.reverse();
                                    this.setStateIndex(GearState.WAIT);
                                }
                            }
                            break;
                        
                        // Moving down
                        case 1 :
                            if (this.isColFlor) {
                                if(this.isColRoof) {
                                    this.setStateIndex(GearState.STOP);
                                }
                                else {
                                    this.move.y = -1;
                                    this.setStateIndex(GearState.WAIT);
                                }
                            }
                            break;
            
                        // Moving up
                        case -1 : 
                            if (this.isColRoof) {
                                if(this.isColFlor) {
                                    this.setStateIndex(GearState.STOP);
                                }
                                else {
                                    this.move.y = 1;
                                    this.setStateIndex(GearState.WAIT);
                                }
                            }
                            break;
                    }
                    break;

                
                case GearState.STOP :
                case GearState.WAIT :

                    switch(this.move.y) {

                        // Moving horizontal
                        case 0 : 
                            if (!this.isColFace) {
                                this.setStateIndex(GearState.NORMAL);
                            }
                            else if (!this.isColBack) {
                                this.reverse();
                                this.setStateIndex(GearState.NORMAL);
                            }
                            else {
                                this.setStateIndex(GearState.STOP);
                            }
                            break;
                        
                        // Moving down
                        case 1 :
                            if (!this.isColFlor) {
                                this.setStateIndex(GearState.NORMAL);
                            }
                            else if (!this.isColRoof) {
                                this.move.y = -1;
                                this.setStateIndex(GearState.NORMAL);
                            }
                            else {
                                this.setStateIndex(GearState.STOP);
                            }
                            break;
            
                        // Moving up
                        case -1 : 
                            if (!this.isColRoof) {
                                this.setStateIndex(GearState.NORMAL);
                            }
                            else if (!this.isColFlor) {
                                this.move.y = 1;
                                this.setStateIndex(GearState.NORMAL);
                            }
                            else {
                                this.setStateIndex(GearState.STOP);
                            }
                            break;
                    }
                    break;
            }
        }
    }
}