import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { Point } from "engine/utilities/vect";

/** Backdrop parameters */
interface Decal {
    position: Point;
    name: string;
}

export interface BackdropParams extends GameObjectParams {
    decals : Decal[];
    type : number;
}

/** Single image gameobject */
export default class Backdrop extends GameObject {
    
    private decals : Decal[];
    private type : number;

    /** Constructor */
    constructor(params: BackdropParams) {
        super(params);

        this.decals = params.decals ?? [];
        this.type = params.type;

        this.decals.forEach(d => console.log(d.name, d.position.x, d.position.y));
    }

    /** Draw this Backdrop */
    public draw(ctx: CanvasRenderingContext2D): void {

        switch(this.type) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
        }

        ctx.fillStyle = "#444";
        this.decals.forEach(d => ctx.fillRect(d.position.x * 2, d.position.y * 2, 10, 10));
    }
}