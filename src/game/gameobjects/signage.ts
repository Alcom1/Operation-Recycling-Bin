import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { wrapText } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import ButtonHintOkay from "./buttonhintokay";
import LevelSequence from "./levelsequence";

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

    private signState : SignState = SignState.OFF;          // State of the current sign
    private signType : SignType = SignType.HINT;            // Current type of sign

    private signObjects : OffsetGameObject[][] = [];        // Objects to be displayed for each sign type

    private binCount : number = 0;                          // Number of bins in the level
    private binEaten : number = 0;                          // Number of bins consumed
    private hint : string = "";                             // Hint text for this level
    private level : Scene | null = null;                    // Current level scene
    private sign : HTMLImageElement;                        // Background image for signs

    private signSpeed : number = 800;                       // Speed of sign transitions
    private initialSignOffset : Vect = new Vect(216, -400); // Starting position of signs
    private signOffset : Vect = Vect.zero;                  // Current position of sign
    private openStop : number = 274;                        // Vertical position where sign stops

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        // Sign is behind its objects
        this.zIndex = 0;

        // Sign background image
        this.sign = this.engine.library.getImage("sign", "svg");

        // Objects for hint sign
        let objectsHint : OffsetGameObject[] = [];
        objectsHint.push({
            gameObject : this.parent.pushGO(new ButtonHintOkay({
                ...params,
                tags : [],
                size : { x : 136, y : 68},
                text : "OK",
                zIndex : 100,
                font : "64px Font04b_08",
                isActive : false
            })),
            offset : new Vect(530, -100)
        });
        this.signObjects[SignType.HINT] = objectsHint;

        // Objects for victory sign
        let objectsWin : OffsetGameObject[] = [];
        this.signObjects[SignType.WIN] = objectsWin;

        // Objects for failure sign
        let objectsFail : OffsetGameObject[] = [];
        this.signObjects[SignType.FAIL] = objectsFail;
        
        // Objects for level start sign
        let objectsStart : OffsetGameObject[] = [];
        this.signObjects[SignType.START] = objectsStart;
    }

    /** Initalize the game object, get related objects */
    public init(ctx: CanvasRenderingContext2D) {

        // Get number of bins in the level
        this.binCount = this.engine.tag.get(
            "CharacterBin", 
            "Level").length;

        // Get hint text
        this.hint = (
            this.engine.tag.get(
                "LevelSequence", 
                "Level")[0] as LevelSequence).hint;

        // Get level scene
        this.level = this.engine.tag.getScene("Level");
    }

    /** Update sign */
    public update(dt : number) {

        // Different sign transitions
        switch(this.signState) {

            // Open transition, move down
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

            // Close transition, move left then unpause
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

            // Sign drop shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
            ctx.shadowBlur = 25;
            ctx.fillRect(this.signOffset.x, this.signOffset.y, 670, 400);

            // Sign
            ctx.drawImage(this.sign, this.signOffset.x, this.signOffset.y);

            // Sign text & non-objects
            if(this.signType == SignType.HINT) {
                ctx.fillStyle = "#111";
                ctx.font = "32px Font04b_08";

                ctx.fillText("Hint :", this.signOffset.x + 56, this.signOffset.y + 72);

                wrapText(ctx, this.hint, 556).forEach((l, i) => {

                    ctx.fillText(l, this.signOffset.x + 56, this.signOffset.y + 72 + i * 32 + 32);
                });
            }
        }
    }

    /** Increment eat counter, check if all bins have been eaten, pause if so */
    public incrementEaten() {

        this.binEaten++;

        // All bins have been eaten, show win sign
        if(this.binCount > 0 && this.binEaten >= this.binCount) {
            this.openSign(SignType.WIN);
        }
    }

    /** Activate and open the sign */
    public openSign(signType : SignType = SignType.HINT) {

        // Hints cannot interupt other signs
        if(signType == SignType.HINT && this.signType != SignType.HINT) {
            return;
        }

        // Do not interupt a sign sequence with itself
        if(signType == this.signType && this.signState != SignState.OFF) {
            return;
        }

        // Setup and activate sign
        this.signState = SignState.OPEN;                // Sign starts by opening
        this.signOffset = this.initialSignOffset.get;   // Reset sign position
        this.signType = signType;                       // Set sign type
        this.signObjects[signType].forEach(oo => {      // Reset objects for this type
            oo.gameObject.isActive = true;
            oo.gameObject.spos = oo.offset.get;
        });
        this.level?.pause();                            // Pause the level
    }

    /** Close the sign */
    public closeSign() {

        this.signState = SignState.CLOSE;
    }
}