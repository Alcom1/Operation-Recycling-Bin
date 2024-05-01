import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";

/** Handles signs and pausing for signs */
export default class Signage extends GameObject {

    private binCount : number = 0;
    private binEaten : number = 0;
    private level : Scene | null = null;
    private showSign : boolean = false;
    private sign : HTMLImageElement;
    private signOffset : number = -400;

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        this.sign = this.engine.library.getImage("sign", "svg");
    }

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init(ctx: CanvasRenderingContext2D) {

        this.binCount = this.engine.tag.get(
            "CharacterBin", 
            "Level").length;

        this.level = this.engine.tag.getScene("Level");
    }

    /** Update sign */
    public update(dt : number) {

        if(this.showSign) {

            if(this.signOffset < 274) {
                this.signOffset += dt * 800;
            }
            if(this.signOffset >= 274) {
                this.signOffset = 274;
            }
        }
    }

    /** Draw sign */
    public draw(ctx : CanvasRenderingContext2D) {

        if(this.showSign) {
            ctx.drawImage(this.sign, 216, this.signOffset);
        }
    }

    /** Increment eat counter, check if all bins have been eaten, pause if so */
    public incrementEaten() {
        this.binEaten++;

        if(this.binCount > 0 && this.binEaten >= this.binCount) {

            this.activateSign();
        }
    }

    /** Activate the sign */
    public activateSign() {

        this.showSign = true;
        this.signOffset = -400;
        this.level?.pause();
    }
}