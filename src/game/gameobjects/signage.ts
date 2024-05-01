import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import Vect from "engine/utilities/vect";
import ButtonHintOkay from "./buttonhintokay";

/** Armor states of a bot character */
enum SignState {
    OFF,
    OPEN,
    CLOSE
}

/** types of signs */
export enum SignType {
    HINT,
    WIN,
    FAIL,
    START
}

/** Parameters for an offset game object */
export interface OffsetGameObject {
    gameObject : GameObject;
    offset : Vect;
}

/** Handles signs and pausing for signs */
export default class Signage extends GameObject {

    private signState : SignState = SignState.OFF;
    private signType : SignType = SignType.HINT;

    private signObjects : OffsetGameObject[][] = [];

    private binCount : number = 0;
    private binEaten : number = 0;
    private level : Scene | null = null;
    private sign : HTMLImageElement;

    private signSpeed : number = 800;
    private initialSignOffset : Vect = new Vect(216, -400);
    private signOffset : Vect = Vect.zero;
    private openStop : number = 274;

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        this.zIndex = 0;

        this.sign = this.engine.library.getImage("sign", "svg");

        let objectsHint : OffsetGameObject[] = [];
        objectsHint.push({
            gameObject : this.parent.pushGO(new ButtonHintOkay({
                ...params,
                tags : [],
                size : { x : 136, y : 68},
                text : "Ok",
                zIndex : 100,
                isActive : false
            })),
            offset : new Vect(530, -100)
        });
        this.signObjects[SignType.HINT] = objectsHint;

        let objectsWin : OffsetGameObject[] = [];
        this.signObjects[SignType.WIN] = objectsHint;

        let objectsFail : OffsetGameObject[] = [];
        this.signObjects[SignType.FAIL] = objectsHint;
        
        let objectsStart : OffsetGameObject[] = [];
        this.signObjects[SignType.START] = objectsHint;
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

        switch(this.signState) {

            case SignState.OPEN : {

                    let signObjectsCurr = this.signObjects[this.signType];

                    if(this.signOffset.y < this.openStop) {
                        this.signOffset.y += dt * this.signSpeed;
                        signObjectsCurr.forEach(o => o.gameObject.spos.y += dt * this.signSpeed);
                    }
                    if(this.signOffset.y >= this.openStop) {
                        signObjectsCurr.forEach(o => o.gameObject.spos.y += this.openStop - this.signOffset.y);
                        this.signOffset.y = this.openStop;
                    }
                }
                break;

            case SignState.CLOSE : {

                    let signObjectsCurr = this.signObjects[this.signType];

                    this.signOffset.x -= dt * this.signSpeed * 1.5;
                    signObjectsCurr.forEach(o => o.gameObject.spos.x -= dt * this.signSpeed * 1.5);
                    
                    if(this.signOffset.x < -670) {
                        this.signState = SignState.OFF;
                        signObjectsCurr.forEach(o => o.gameObject.isActive = false);
                        this.level?.unpause();
                    }
                }
                break;
        }
    }

    /** Draw sign */
    public draw(ctx : CanvasRenderingContext2D) {

        if(this.signState != SignState.OFF) {

            ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
            ctx.shadowBlur = 25;
            ctx.fillRect(this.signOffset.x, this.signOffset.y, 670, 400);

            ctx.drawImage(this.sign, this.signOffset.x, this.signOffset.y);
        }
    }

    /** Increment eat counter, check if all bins have been eaten, pause if so */
    public incrementEaten() {

        this.binEaten++;

        if(this.binCount > 0 && this.binEaten >= this.binCount) {
            this.openSign(SignType.WIN);
        }
    }

    /** Activate the sign */
    public openSign(signType : SignType = SignType.HINT) {

        this.signState = SignState.OPEN;
        this.signOffset = this.initialSignOffset.get;
        this.signType = signType;
        this.signObjects[signType].forEach(oo => {
            oo.gameObject.isActive = true;
            oo.gameObject.spos = oo.offset.get;
        });
        this.level?.pause();
    }

    /** Activate the sign */
    public closeSign() {

        this.signState = SignState.CLOSE;
    }
}