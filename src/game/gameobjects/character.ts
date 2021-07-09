import Engine from "engine/engine";
import Scene from "engine/scene/scene";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, getZIndex, GMULTX, GMULTY, round } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";
import Brick from "./brick";
import Cursor from "./cursor";
import SpriteCharacter, { SpriteCharacterParams } from "./spritecharacter";

export interface CharacterParams extends GameObjectParams {
    height? : number;
    speed? : number;
    images : CharacterImageParams[];
    imagesMisc : CharacterImageParams[];
    animFrames : number;
    animCount : number;
}

export interface CharacterImageParams {
    name : string;
    extension : string;
    offset : number;
}

export interface CharacterImage {
    image : HTMLImageElement;
    offset : number;
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

    protected segmentIndex = 0;
    protected segments: SpriteCharacter[][] = [[]];
    protected get segmentsCurr() : SpriteCharacter[] { return this.segments[this.segmentIndex] }

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);
        
        this.speed = params.speed ?? 1;     //Default speed
        this.move = new Vect(1, 0);         //Default move directions
        this._height = params.height ?? 2;  //Default height for a character
        this.checkCollision = true;

        //Spawn sprite segments
        for(let i = -1; i < 4; i++) {

            //Generate segment
            const segment = new SpriteCharacter(this.engine, {
                ...params, 
                order : i, 
                width : GMULTX 
            } as SpriteCharacterParams);
            this.segmentsCurr.push(segment);
            
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
    }

    public update(dt: number) {

        //Increment position by speed
        this.spos.x += this.move.x * this.speed * GMULTX * dt;

        //Step grid position further once subposition goes past a grid-unit
        if (Math.abs(this.spos.x) > GMULTX) {

            var dir = Math.sign(this.spos.x);

            this.spos.x -= GMULTX * dir;
            this.gpos.x += dir;


            this.checkCollision = true;
        }

        //Check collision
        if(this.checkCollision) {

            this.handleCollision();
            this.handleBricks();

            this.segmentsCurr.forEach(s => s.updateSprite(this.gpos));
            this.level.sortGO();

            this.checkCollision = false;
        }
    }

    private handleBricks() {

        this.underBricks.forEach(b => b.pressure -= 1);

        this.underBricks = this.brickHandler.checkCollisionRow(
            this.gpos.getAdd({x : -1, y : 1}), 
            2);

        this.underBricks.forEach(b => b.pressure += 1);
        this.brickHandler.isPressured = true;
    }

    protected handleCollision() {

    }

    protected reverse() {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
        this.segmentsCurr.forEach(x => x.direction = this.move.x);
    }
}
