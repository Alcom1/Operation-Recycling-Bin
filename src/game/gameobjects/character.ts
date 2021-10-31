import Engine from "engine/engine";
import Scene from "engine/scene/scene";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { getZIndex, GMULTX, GMULTY } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import BrickHandler from "./brickhandler";
import Brick from "./bricknormal";
import Animat, { OffsetImageParams, AnimationParams } from "./animation";

export interface CharacterParams extends GameObjectParams {
    height? : number;
    speed? : number;
    images : OffsetImageParams[];
    frameCount : number;
    animsCount : number;
}

export default class Character extends GameObject {

    private speed: number;
    protected _height: number;
    public get height() { return this._height; }
    protected move: Vect;
    protected brickHandler!: BrickHandler;
    private underBricks: Brick[] = [];
    protected checkCollision: boolean;

    protected animatGroupsIndex = 0;
    protected animatGroups: Animat[][] = [[]];
    protected get animatGroupCurr() : Animat[] { return this.animatGroups[this.animatGroupsIndex] }
    protected get isNormalMovment() : boolean { return this.animatGroupsIndex == 0 }
    protected get animImageIndex() : number { return this.move.x }

    constructor(params: CharacterParams) {
        super(params);

        this.tags.push("Character");        //All characters need to share a tag
        
        this.speed = params.speed ?? 1;     //Default speed
        this.move = new Vect(1, 0);         //Default move directions
        this._height = params.height ?? 2;  //Default height for a character
        this.checkCollision = true;

        //Spawn 3 animations, the sprite is sliced vertically into 2x wide segments for proper z-indexing
        for(let i = -1; i <= 1; i ++) {
            
            // Add segment to scene and this character
            this.animatGroupCurr.push(this.parent.pushGO(new Animat({
                    ...params, 
                    isLoop : false,                 //Remove looping to prevent stuttering. Loops are handled manually
                    zModifier : i < 1 ? 300 : 29,   //Z-modifier for different slices
                    sliceIndex : i,                 //This animation is sliced
                    framesSize : GMULTX * 2,        //2x wide slices
                    gposOffset : { x : -1, y : 0 }  //Move back by 1. Animations are centered around this character
                } as AnimationParams)) as Animat);
        }
    }

    public init() {

        // Get brickhandler for pressure checks
        this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0] as BrickHandler;

        // Set active groups
        this.setCurrentGroup();
    }

    public update(dt: number) {

        //Normal or unique movement
        if(this.isNormalMovment) {
            this.handleNormalMovement(dt);
        }
        else {
            this.handleSpecialMovement(dt);
        }

        //Handle collision, set zIndices for new position
        if(this.checkCollision) {

            this.handleCollision();
            this.handleBricks();

            this.animatGroupCurr.forEach(s => s.reset(this.gpos));

            this.checkCollision = false;
        }
    }

    //Move forward and set collection check at each step.
    private handleNormalMovement(dt: number) {

        //Increment position by speed
        this.spos.x += this.move.x * this.speed * GMULTX * dt;

        //Step grid position further once subposition goes past a grid-unit
        if (Math.abs(this.spos.x) > GMULTX) {

            var dir = Math.sign(this.spos.x);

            this.spos.x -= GMULTX * dir;
            this.gpos.x += dir;

            this.checkCollision = true;
        }
    }

    //Do nothing - override
    protected handleSpecialMovement(dt: number) {

    }

    //Manage bricks underneath this character, set pressure
    protected handleBricks(isClear : boolean = false) {

        //Reset pressures
        this.underBricks.forEach(b => b.pressure -= 1);

        //Reset underbricks if we are clearing unconditionally.
        if(isClear) {
            this.underBricks = [];
            this.brickHandler.isPressured = true;
        }
        //Otherwise, get a new set.
        else {
            //Get new set of bricks for pressures
            this.underBricks = this.brickHandler.checkCollisionRow(
                this.gpos.getAdd({x : -1, y : 1}), 
                2);
    
            //Set new pressures
            this.underBricks.forEach(b => b.pressure += 1);
            this.brickHandler.isPressured = true;
        }
    }

    //Do nothing - override
    protected handleCollision() {

    }

    //Reverse the direction of this character
    protected reverse() {

        this.move.x *= -1;
        this.gpos.x += this.move.x;
        this.animatGroups[0].forEach(x => x.setImageIndex(this.animImageIndex));
    }

    //Set current & active group based on the group index
    protected setCurrentGroup(index? : number) {
        
        index = index ?? this.animatGroupsIndex;
        this.animatGroupsIndex = index;
        this.animatGroups.forEach((sg, i) => sg.forEach(s => {
            s.isActive = i == index;
            s.spos = { x : 0, y : 0} as Vect;   //Reset subposition
            s.reset(this.gpos);           //Make sure all sprites are in the character's position after set
        }));
        this.animatGroupCurr.forEach(x => x.setImageIndex(this.animImageIndex));
    }

    //Deactivate this gameObject
    public deactivate() {
        this.isActive = false;
        this.animatGroups.forEach(sg => sg.forEach(s => s.isActive = false));
        this.underBricks.forEach(b => b.pressure -= 1);
        this.underBricks = [];
    }
}