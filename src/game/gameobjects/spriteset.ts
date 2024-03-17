import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { Point } from "engine/utilities/vect";

/** Sprite parameters */
export interface SpriteParams extends GameObjectParams {
    image: string | string[];
    extension?: string;
    size?: Point;
}

/** Single image gameobject */
export default class SpriteSet extends GameObject {
    
    private images : HTMLImageElement[] = [];   //Images for this sprite set
    protected imageIndex : number = 0;          //Index of current image
    private get image() : HTMLImageElement { return this.images[this.imageIndex] };
    private size? : Point;                      //Size for z-indexing

    /** z-index get/setters */
    public get zSize() { return this.size ?? super.zSize; }

    /** Constructor */
    constructor(params: SpriteParams) {
        super(params);

        if(Array.isArray(params.image)) {

            params.image.forEach(i => {
                this.images.push(this.engine.library.getImage(i, params.extension));
            })
        }
        else {

            this.images.push(this.engine.library.getImage(params.image, params.extension));
        }

        this.size = params.size;
    }

    /** Draw this sprite */
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }
}