import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";
import Brick from "./brick";
import Cursor from "./cursor";

export interface CharacterParams extends GameObjectParams {
    speed?: number;
}

export default class Character extends GameObject {
    private speed: number;
    protected move: Vect;
    protected brickHandler!: BrickHandler;
    private underBricks: Brick[] = [];
    private cursor!: Cursor;
    protected checkCollision: boolean;

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);
        this.speed = params.speed ?? 1;
        this.move = new Vect(1, 1);
        this.checkCollision = true;
    }

    public init(ctx: CanvasRenderingContext2D) {
        
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

            this.checkCollision = false;
        }
    }

    private handleBricks() {

        this.underBricks.forEach(b => b.pressure -= 1);

        this.underBricks = this.brickHandler.checkCollisionRow(
            this.gpos.getAdd(new Vect(-1, 1)), 
            2);

        this.underBricks.forEach(b => b.pressure += 1);
        this.brickHandler.isPressured = true;
    }

    protected handleCollision() {

    }

    protected reverse() {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
    }

    public draw(ctx: CanvasRenderingContext2D) {

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#F00"
        ctx.lineWidth = 4;
        ctx.strokeRect(
           -GMULTX, 
            GMULTY, 
            GMULTX * 2, 
            GMULTY * 2);
    }
}
