import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { Point } from "engine/utilities/vect";

/** Sprite parameters */
export interface SpriteParams extends GameObjectParams {
    image: string;
    extension?: string;
    size?: Point;
}

/** Single image gameobject */
export default class Sprite extends GameObject {
    
    private image : HTMLImageElement;
    private size? : Point;

    /** z-index get/setters */
    public get zSize() { return this.size ?? super.zSize; }

    /** Constructor */
    constructor(params: SpriteParams) {
        super(params);

        this.image = this.engine.library.getImage(params.image, params.extension);
        this.size = params.size;
    }

    /** Draw this sprite */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}