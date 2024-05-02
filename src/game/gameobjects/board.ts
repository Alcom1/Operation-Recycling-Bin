import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { wrapText } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import ButtonHintOkay from "./buttonhintokay";
import ButtonScene from "./buttonscene";
import Counter from "./counter";
import LevelSequence from "./levelsequence";
import BoxShadow from "./boxshadow";
import SpriteSet from "./spriteset";

/** Armor states of a bot character */
enum BoardState {
    OFF,
    OPEN,
    CLOSE
}

/** types of boards */
export enum BoardType {
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

/** Handles boards and pausing for boards */
export default class Board extends GameObject {

    private boardState : BoardState = BoardState.OFF;   // State of the current board
    private boardType : BoardType = BoardType.HINT;     // Current type of board

    private boardObjects : OffsetGameObject[][] = [];   // Objects to be displayed for each board type

    private binCount : number = 0;                      // Number of bins in the level
    private binEaten : number = 0;                      // Number of bins consumed
    private hint : string = "";                         // Hint text for this level
    private counter : Counter | null = null;            // Counter for current level
    private level : Scene | null = null;                // Current level scene

    private boardSpeed : number = 2000;                  // Speed of board transitions
    private boardOffset : Vect = Vect.zero;             // Current position of board
    private openStops : number[] = [                    // Vertical position where board stops
        674,    //HINT
        730,    //WIN
        674,    //FAIL
        674]    //START
    private get openStop() : number {                   // Vertical board stop position for the current state
        return this.openStops[this.boardType]; 
    }
    private gold : HTMLImageElement;                    // Gold square

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        //Gold square image
        this.gold = this.engine.library.getImage("gold", "svg");

        // Objects for hint board
        let objectsHint : OffsetGameObject[] = [];
        objectsHint.push({
            gameObject : this.parent.pushGO(new BoxShadow({
                ...params,
                tags : [],
                size : { x : 670, y : 400},
                zIndex : -200,
            })),
            offset : new Vect(216, -400)
        },{
            gameObject : this.parent.pushGO(new SpriteSet({
                ...params,
                tags : [],
                image : "board_medium",
                extension : "svg",
                zIndex : -100
            })),
            offset : new Vect(216, -400)
        },{
            gameObject : this.parent.pushGO(new ButtonHintOkay({
                ...params,
                tags : [],
                size : { x : 136, y : 68},
                text : "OK",
                zIndex : 100,
                font : "64px Font04b_08"
            })),
            offset : new Vect(530, -100)
        });
        this.boardObjects[BoardType.HINT] = objectsHint;

        // Objects for victory board
        let objectsWin : OffsetGameObject[] = [];        
        objectsWin.push({
            gameObject : this.parent.pushGO(new BoxShadow({
                ...params,
                tags : [],
                size : { x : 820, y : 548},
                zIndex : -200,
            })),
            offset : new Vect(122, -546)
        },{
            gameObject : this.parent.pushGO(new SpriteSet({
                ...params,
                tags : [],
                image : "board_large",
                extension : "svg",
                zIndex : -100
            })),
            offset : new Vect(122, -546)
        },{
            gameObject : this.parent.pushGO(new ButtonScene({
                ...params,
                tags : [],
                size : { x : 200, y : 32},
                text : "Previous Level",
                zIndex : 100
            })),
            offset : new Vect(760, -134)
        },{
            gameObject : this.parent.pushGO(new ButtonScene({
                ...params,
                tags : [],
                size : { x : 200, y : 32},
                text : "Next Level",
                isFocus : true,
                zIndex : 100
            })),
            offset : new Vect(760, -82)
        });
        this.boardObjects[BoardType.WIN] = objectsWin;

        // Objects for failure board
        let objectsFail : OffsetGameObject[] = [];
        this.boardObjects[BoardType.FAIL] = objectsFail;
        
        // Objects for level start board
        let objectsStart : OffsetGameObject[] = [];
        this.boardObjects[BoardType.START] = objectsStart;

        //All board objects start as inactive
        this.boardObjects.forEach(so => so.forEach(oo => oo.gameObject.isActive = false));
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

        // Get move counter
        this.counter = (
            this.engine.tag.get(
                "Counter", 
                "LevelInterface")[0] as Counter);

        // Get level scene
        this.level = this.engine.tag.getScene("Level");
    }

    /** Update board */
    public update(dt : number) {

        // Different board transitions
        switch(this.boardState) {

            // Open transition, move down
            case BoardState.OPEN : {

                    let boardObjectsCurr = this.boardObjects[this.boardType];

                    if(this.boardOffset.y < this.openStop) {
                        this.boardOffset.y += dt * this.boardSpeed;
                        boardObjectsCurr.forEach(o => o.gameObject.spos.y += dt * this.boardSpeed);
                    }
                    if(this.boardOffset.y >= this.openStop) {
                        boardObjectsCurr.forEach(o => o.gameObject.spos.y += this.openStop - this.boardOffset.y);
                        this.boardOffset.y = this.openStop;
                    }
                }
                break;

            // Close transition, move left then unpause
            case BoardState.CLOSE : {

                    let boardObjectsCurr = this.boardObjects[this.boardType];

                    this.boardOffset.x -= dt * this.boardSpeed * 1.5;
                    boardObjectsCurr.forEach(o => o.gameObject.spos.x -= dt * this.boardSpeed * 1.5);
                    
                    if(this.boardOffset.x < -840) {
                        this.boardState = BoardState.OFF;
                        boardObjectsCurr.forEach(o => o.gameObject.isActive = false);
                        this.level?.unpause();
                    }
                }
                break;
        }
    }

    /** Draw board */
    public draw(ctx : CanvasRenderingContext2D) {

        if(this.boardState != BoardState.OFF) {

            // Board text & non-objects
            switch(this.boardType) {

                case BoardType.HINT : {

                        ctx.fillStyle = "#111";
                        ctx.font = "32px Font04b_08";
                        ctx.fillText("Hint :", this.boardOffset.x + 272, this.boardOffset.y - 328);
                        wrapText(ctx, this.hint, 556).forEach((l, i) => {
        
                            ctx.fillText(l, this.boardOffset.x + 272, this.boardOffset.y - 328 + i * 32 + 32);
                        });
                    }
                    break;
                
                case BoardType.WIN : {

                        ctx.fillStyle = "#FFF";
                        ctx.font = "64px Font04b_08";
                        ctx.fillText("level complete!", this.boardOffset.x + 194, this.boardOffset.y - 444);

                        ctx.fillStyle = "#111";
                        ctx.font = "32px Font04b_08";
                        ctx.fillText(`moves:${this.counter?.count}`, this.boardOffset.x + 190, this.boardOffset.y - 134);

                        ctx.fillStyle = "#555";
                        // Under par
                        if(this.counter?.underPar) {

                            ctx.fillText("gold award", this.boardOffset.x + 218, this.boardOffset.y - 100);

                            ctx.drawImage(this.gold, this.boardOffset.x + 193, this.boardOffset.y - 118);
                        }
                        // Over par
                        else {

                            ctx.font = "16px Font04b_08";

                            ctx.fillText(`beat this level in ${this.counter?.par} or fewer`, 
                                this.boardOffset.x + 190, 
                                this.boardOffset.y - 108);

                            ctx.fillText("moves to get the gold award.",
                                this.boardOffset.x + 190, 
                                this.boardOffset.y - 92);
                        }
                    }
                    break;
            }
        }
    }

    /** Increment eat counter, check if all bins have been eaten, pause if so */
    public incrementEaten() {

        this.binEaten++;

        // All bins have been eaten, show win board
        if(this.binCount > 0 && this.binEaten >= this.binCount) {
            this.openBoard(BoardType.WIN);
        }
    }

    /** Activate and open the board */
    public openBoard(boardType : BoardType = BoardType.HINT) {

        // Hints cannot interupt other boards
        if(boardType == BoardType.HINT && this.boardType != BoardType.HINT) {
            return;
        }

        // Do not interupt a board sequence with itself
        if(boardType == this.boardType && this.boardState != BoardState.OFF) {
            return;
        }

        // Setup and activate board
        this.boardState = BoardState.OPEN;              // Board starts by opening
        this.boardOffset = Vect.zero;                   // Reset board position
        this.boardType = boardType;                     // Set board type
        this.boardObjects[boardType].forEach(oo => {    // Reset objects for this type
            oo.gameObject.isActive = true;
            oo.gameObject.spos = oo.offset.get;
        });
        this.level?.pause();                            // Pause the level
    }

    /** Close the board */
    public closeBoard() {

        this.boardState = BoardState.CLOSE;
    }
}