import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";
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
    isForward? : boolean;
    isGlide? : boolean;
    stateAnimations : number[];
    animsMisc : AnimationInputParams[];
}

interface AnimationInputParams extends AnimationParams {
    isSliced? : boolean;
}

export default class Character extends GameObject {

    public get height() { return this._height; }    //Collision height of this character
    protected _height: number;
    protected move: Vect;                           //Movement direction of this character
    protected brickHandler!: BrickHandler;          //Brick handler for brick pressure (bricks under this character)
    protected checkCollision: boolean;              //If collision needs to be checked
    private speed: number;                          //Speed of this character
    private isGlide: boolean;                       //If the character sprite matches the character's subposition
    private underBricks: Brick[] = [];              //Bricks under pressure, under this character

    //protected animatGroupsIndex = 0;
    protected animations: Animat[][] = [[]];
    protected stateAnimations: number[];
    protected stateIndex: number = 0;
    protected get animationsCurr() : Animat[] { return this.animations[this.stateAnimations[this.stateIndex]]; }
    //protected get animatGroupCurr() : Animat[] { return this.animations[this.animatGroupsIndex] }
    protected get isNormalMovment() : boolean { return this.stateIndex == 0 }
    protected get animImageIndex() : number { return this.move.x }

    constructor(params: CharacterParams) {
        super(params);

        this.tags.push("Character");                                //All characters need to share a tag
        
        this.speed = params.speed ?? 1;                             //Default speed
        this.move = new Vect(params.isForward ?? true ? 1 : -1, 0); //Default move direction
        this._height = params.height ?? 2;                          //Default height for a character
        this.isGlide = params.isGlide ?? false;                     //Default glide state
        this.checkCollision = true;                                 //Force initial collision check
        this.stateAnimations = [0, ...(params.stateAnimations ?? [])];

        const mainZIndex =                                          //Z-index of main slices in the character sprite
            this.height * 100 - (
            this.isGlide ? 100 : 0);

        //Spawn 3 animations, the sprite is sliced vertically into 2x wide segments for proper z-indexing
        for(let i = -1; i <= 1; i ++) {
            
            // Add segment to scene and this character
            this.animationsCurr.push(this.parent.pushGO(new Animat({
                    ...params, 
                    isLoop : false,                                 //Remove looping to prevent stuttering. Loops are handled manually
                    zModifier : i < 1 ? mainZIndex : 29,            //Z-modifier for different slices
                    sliceIndex : i,                                 //This animation is sliced
                    framesSize : GMULTX * 2,                        //2x wide slices
                    gposOffset : { x : -1, y : 0 }                  //Move back by 1. Animations are centered around this character
                } as AnimationParams)) as Animat);
        }

        //Setup miscellaneous animations.
        params.animsMisc?.forEach(m => {

            //Build a new animation, store it here and in the scene
            var newIndex = this.animations.push([]) - 1;

            //3 slices if sliced, 1 otherwise
            for(let i = -1; i <= (m.isSliced ? 1 : -1); i ++) {

                this.animations[newIndex].push(new Animat({
                    ...params,
                    speed :      m.speed,
                    images :     m.images,
                    sliceIndex : m.isSliced ? i : null,
                    framesSize : m.isSliced ? GMULTX * 2 : m.framesSize,
                    gposOffset : m.gposOffset,
                    zModifier :  m.isSliced ? (i < 1 ? 300 : 29) : m.zModifier,
                    frameCount : m.frameCount,
                    animsCount : m.animsCount,
                    isLoop :     m.isLoop
                } as AnimationParams));
            }
            this.animations[newIndex].forEach(a => this.parent.pushGO(a));
        });
    }

    public init() {

        // Get brickhandler for pressure checks
        this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0] as BrickHandler;

        // Set active groups
        this.setStateIndex();
    }

    public update(dt: number) {

        //Normal or unique movement, shift grid/sub position after movement
        if(this.isNormalMovment) {
            this.handleNormalMovement(dt);
            this.gridStep();
        }
        else {
            this.handleSpecialMovement(dt);
            this.gridStep();
            this.checkCollision = true;
        }

        //Handle collision, set zIndices for new position
        if(this.checkCollision) {

            this.handleCollision();
            this.handleBricks();

            if(this.isNormalMovment) {
                this.animationsCurr.forEach(s => s.reset(this.gpos));
            }

            this.checkCollision = false;
        }
    }

    //Shift to next grid position of the subposition extends too far
    private gridStep() {

        var move = {
            x : Math.abs(this.spos.x) > GMULTX ? Math.sign(this.spos.x) : 0,
            y : Math.abs(this.spos.y) > GMULTY ? Math.sign(this.spos.y) : 0
        };

        if(move.x || move.y) {
    
            this.gpos.add(move);    //Go up or down to new grid position
            this.spos.sub({         //Reset subposition to match new grid position
                x : move.x * GMULTX,
                y : move.y * GMULTY
            });            
    
            //Update animations to match
            this.animationsCurr.forEach(a => {
                a.gpos.add(move);
            });

            this.checkCollision = true;         //Set to check collision for the new step
            this.brickHandler.isRecheck = true; //Recheck bricks after every shift
        }

        if(this.isGlide) {
            this.animationsCurr.forEach(a => {
                a.spos = this.spos;
            });
        }
    }

    //Move forward and set collection check at each step.
    private handleNormalMovement(dt: number) {

        //Increment position by speed
        this.spos.x += this.move.x * this.speed * GMULTX * dt;
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
        }
        //Otherwise, get a new set.
        else {
            //Get new set of bricks for pressures
            this.underBricks = this.brickHandler.checkCollisionRow(
                this.gpos.getAdd({x : -1, y : 1}), 
                2);
    
            //Set new pressures
            this.underBricks.forEach(b => b.pressure += 1);
        }
    }

    //Do nothing - override
    protected handleCollision() {

    }

    //Reverse the direction of this character
    protected reverse() {

        this.move.x *= -1;                                                          //Reverse direction
        this.animations[0].forEach(x => x.setImageIndex(this.animImageIndex));    //Establish sprites for new direction
        
        //If gliding force-reset the sprite to match its current position
        if(this.isGlide) {
            this.animationsCurr.forEach(a => a.reset(this.gpos));
        }
        //Otherwise move the sprite over in its movement direction
        if(!this.isGlide) {
            this.gpos.x += this.move.x;
        }
    }

    //Set current & active group based on the group index
    protected setStateIndex(index? : number) {
        
        this.stateIndex = index ?? this.stateIndex;
        this.animations.forEach((sg, i) => sg.forEach(s => {
            s.isActive = i == this.stateAnimations[this.stateIndex];
            s.spos.setToZero();   //Reset subposition
            s.reset(this.gpos); //Make sure all sprites are in the character's position after set
        }));
        this.animationsCurr.forEach(x => x.setImageIndex(this.animImageIndex));
    }

    //Deactivate this gameObject
    public deactivate() {
        this.isActive = false;
        this.animations.forEach(sg => sg.forEach(s => s.isActive = false));
        this.underBricks.forEach(b => b.pressure -= 1);
        this.underBricks = [];
    }
}