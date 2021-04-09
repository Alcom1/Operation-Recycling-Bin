import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";

interface CharacterParams extends GameObjectParams {
    size?: Point;
    speed?: number;
}

export default class Character extends GameObject {
    private size: Vect;
    private speed: number;
    private text: string = '';
    private move: Vect;
    private brickHandler!: BrickHandler;
    private checkCollision: boolean;

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);
        this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
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

        if (this.checkCollision) {
            
            if (this.move.x < 0) {

                if (
                    this.brickHandler.checkSelectionCollisionHorz(
                        this.gpos,
                        1)) {

                    this.gpos.y -= 1;
                }
                else if (
                    this.gpos.x <= BOUNDARY.minx ||
                    this.brickHandler.checkSelectionCollisionHorz(
                        this.gpos.getAdd(new Vect(-1, -1 )),
                        this.size.y - 1)) {

                    this.move.x = 1;
                }
            }
            else if(this.move.x > 0) {

                if (
                    this.brickHandler.checkSelectionCollisionHorz(
                        this.gpos.getAdd(new Vect(this.size.x - 1, 0 )),
                        1)) {

                    this.gpos.y -= 1;
                }
                else if (this.gpos.x > BOUNDARY.maxx ||
                    this.brickHandler.checkSelectionCollisionHorz(
                        this.gpos.getAdd(new Vect(this.size.x, -1 )),
                        this.size.y - 1)) {

                    this.move.x = -1;
                }
                 
            }
            else {
                this.checkCollision = false;
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {

        ctx.strokeStyle = "#F00"
        ctx.lineWidth = 4;
        ctx.strokeRect(
            0, 
            GMULTY, 
            this.size.x * GMULTX, 
           -this.size.y * GMULTY);

        ctx.translate(-this.spos.x, 0);
        
        ctx.fillStyle = "#FF0"
        ctx.globalAlpha = 0.5;
        ctx.fillRect(
            0, 
            GMULTY, 
            this.size.x * GMULTX, 
           -this.size.y * GMULTY);
    }
}
