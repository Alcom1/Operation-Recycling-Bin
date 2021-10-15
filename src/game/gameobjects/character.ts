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

    private level!: Scene;
    private speed: number;
    protected _height: number;
    public get height() { return this._height; }
    protected move: Vect;
    protected brickHandler!: BrickHandler;
    private underBricks: Brick[] = [];
    protected checkCollision: boolean;

    protected spriteGroupIndex = 0;
    protected spriteGroups: Animat[][] = [[]];
    protected get spriteGroupCurr() : Animat[] { return this.spriteGroups[this.spriteGroupIndex] }
    protected get isNormalMovment() : boolean { return this.spriteGroupIndex == 0 }

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);

        this.tags.push("Character");        //All characters need to share a tag
        
        this.speed = params.speed ?? 1;     //Default speed
        this.move = new Vect(1, 0);         //Default move directions
        this._height = params.height ?? 2;  //Default height for a character
        this.checkCollision = true;

        //Spawn 3 animations, the sprite is sliced vertically into 2x wide segments for proper z-indexing
        for(let i = -1; i <= 1; i ++) {

            //Generate segment
            const segment = new Animat(this.engine, {
                ...params, 
                isLoop : false,
                zModifier : i < 1 ? 300 : 29,
                sliceIndex : i,
                framesSize : GMULTX * 2,
                gposOffset : { x : -1, y : 0 }
            } as AnimationParams);
            this.spriteGroupCurr.push(segment);
            
            // Add segment game object to scene
            this.parent.pushGO(segment);
        }
    }

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]) {

        // Get level.
        const level = scenes.find(s => s.name == "Level");
        if (!level) throw new Error("Can't find level");
        this.level = level;

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
            this.handleUniqueMovmeent(dt);
        }

        //Handle collision, set zIndices for new position
        if(this.checkCollision) {

            this.handleCollision();
            this.handleBricks();

            this.spriteGroupCurr.forEach(s => s.updateSprite(this.gpos));
            this.level.sortGO();

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
    protected handleUniqueMovmeent(dt: number) {

    }

    //Manage bricks underneath this character, set pressure
    private handleBricks() {

        //Reset pressures
        this.underBricks.forEach(b => b.pressure -= 1);

        //Get new set of bricks for pressures
        this.underBricks = this.brickHandler.checkCollisionRow(
            this.gpos.getAdd({x : -1, y : 1}), 
            2);

        //Set new pressures
        this.underBricks.forEach(b => b.pressure += 1);
        this.brickHandler.isPressured = true;
    }

    //Do nothing - override
    protected handleCollision() {

    }

    //Reverse the direction of this character
    protected reverse() {

        this.move.x *= -1;
        this.gpos.x += this.move.x;
        this.spriteGroups[0].forEach(x => x.setImageIndex(this.move.x));
    }

    //Set current & active group based on the group index
    protected setCurrentGroup(index? : number) {
        
        index = index ?? this.spriteGroupIndex;
        this.spriteGroupIndex = index;
        this.spriteGroups.forEach((sg, i) => sg.forEach(s => {
            s.isActive = i == index;
            s.updateSprite(this.gpos);
        }));
    }

    //Deactivate this gameObject
    public deactivate() {
        this.isActive = false;
        this.spriteGroups.forEach(sg => sg.forEach(s => s.isActive = false));
        this.underBricks.forEach(b => b.pressure -= 1);
        this.underBricks = [];
    }
}
