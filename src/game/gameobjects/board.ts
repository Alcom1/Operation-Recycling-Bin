import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { colPointRect, wrapText } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import ButtonScene from "./buttonscene";
import Counter from "./counter";
import LevelSequence from "./levelsequence";
import BoxShadow from "./boxshadow";
import SpriteSet from "./spriteset";
import Button from "./button";
import ButtonFailHint from "./buttonfailhint";
import { MouseState } from "engine/modules/mouse";

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

/** Board with its set of objects and attributes */
export interface BoardSet {
    boardObjects : OffsetGameObject[];
    stopHeight : number;
    size : Vect;
    offset : Vect;
    pressExit : boolean;
    autoCloseTime : number;
}

/** Extend canvas context for letter spacing */
interface Board_CanvasRenderingContext2D extends CanvasRenderingContext2D {
    letterSpacing : string;
}
 
/** Handles boards and pausing for boards */
export default class Board extends GameObject {

    private boardState : BoardState = BoardState.OFF;   // State of the current board
    private boardType : BoardType = BoardType.HINT;     // Current type of board
    private nextBoardType : BoardType | null = null     // Next board type queued

    private boardSets : BoardSet[] = [];                // Objects to be displayed for each board type

    private binCount : number = 0;                      // Number of bins in the level
    private binEaten : number = 0;                      // Number of bins consumed
    private counter : Counter | null = null;            // Counter for current level
    private sequence : LevelSequence | null = null;     // Level sequence
    private level : Scene | null = null;                // Current level scene

    private boardSpeed : number = 1000;                 // Speed of board transitions
    private boardOffset : Vect = Vect.zero;             // Current position of board
    private autoCloseTimer : number = 0;                // Timer for auto-close

    private gold : HTMLImageElement;                    // Gold square
    private buildings : HTMLImageElement[] = [];        // Buildings

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        //Gold square image
        this.gold = this.engine.library.getImage("gold", "svg");

        //Building images
        for(let i = 0; i < 4; i++) {
            this.buildings.push(this.engine.library.getImage(`building_${i}`, "svg"));
        }

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
            gameObject : this.parent.pushGO(new Button({
                ...params,
                tags : [],
                size : { x : 136, y : 68},
                text : "OK",
                zIndex : 100,
                font : "64px Font04b_08"
            })),
            offset : new Vect(530, -100)
        });
        this.boardSets[BoardType.HINT] = {
            boardObjects : objectsHint,
            stopHeight : 674,
            size : new Vect(670, 400),
            offset : new Vect(216, -400),
            pressExit : true,
            autoCloseTime : -1
        };

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
                text : "Select Level",
                zIndex : 100,
                sceneName : "Menu",
                isLevelScene : false
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
        this.boardSets[BoardType.WIN] = {
            boardObjects : objectsWin,
            stopHeight : 730,
            size : new Vect(670, 400),
            offset : new Vect(216, -400),
            pressExit : false,
            autoCloseTime : -1
        };

        // Objects for failure board
        let objectsFail : OffsetGameObject[] = [];
        objectsFail.push({
            gameObject : this.parent.pushGO(new BoxShadow({
                ...params,
                tags : [],
                size : { x : 670, y : 328},
                zIndex : -200,
            })),
            offset : new Vect(216, -400)
        },{
            gameObject : this.parent.pushGO(new SpriteSet({
                ...params,
                tags : [],
                image : "board_small",
                extension : "svg",
                zIndex : -100
            })),
            offset : new Vect(216, -400)
        },{
            gameObject : this.parent.pushGO(new SpriteSet({
                ...params,
                tags : [],
                image : "disappointed",
                extension : "svg",
                zIndex : 50
            })),
            offset : new Vect(276, -340)
        },{
            gameObject : this.parent.pushGO(new ButtonScene({
                ...params,
                tags : [],
                size : { x : 160, y : 68},
                text : "Select\nLevel",
                zIndex : 100,
                font : "32px Font04b_08",
                sceneName : "Menu",
                isLevelScene : false
            })),
            offset : new Vect(355, -175)
        },{
            gameObject : this.parent.pushGO(new ButtonFailHint({
                ...params,
                tags : [],
                size : { x : 160, y : 68},
                text : "Get\nHint",
                zIndex : 100,
                font : "32px Font04b_08"
            })),
            offset : new Vect(545, -175)
        },{
            gameObject : this.parent.pushGO(new ButtonScene({
                ...params,
                tags : [],
                size : { x : 160, y : 68},
                text : "Try\nAgain",
                zIndex : 100,
                font : "32px Font04b_08"
            })),
            offset : new Vect(735, -175)
        });
        this.boardSets[BoardType.FAIL] = {
            boardObjects : objectsFail,
            stopHeight : 674,
            size : new Vect(670, 328),
            offset : new Vect(216, -400),
            pressExit : false,
            autoCloseTime : -1
        };
        
        // Objects for level start board
        let objectsStart : OffsetGameObject[] = [];
        objectsStart.push({
            gameObject : this.parent.pushGO(new BoxShadow({
                ...params,
                tags : [],
                size : { x : 670, y : 328},
                zIndex : -200,
            })),
            offset : new Vect(216, -400)
        },{
            gameObject : this.parent.pushGO(new SpriteSet({
                ...params,
                tags : [],
                image : "board_small",
                extension : "svg",
                zIndex : -100
            })),
            offset : new Vect(216, -400)
        });
        this.boardSets[BoardType.START] = {
            boardObjects : objectsStart,
            stopHeight : 674,
            size : new Vect(670, 328),
            offset : new Vect(216, -400),
            pressExit : true,
            autoCloseTime : 2
        };

        //All board objects start as inactive
        this.boardSets.forEach(so => so.boardObjects.forEach(oo => oo.gameObject.isActive = false));
    }

    /** Initalize the game object, get related objects */
    public init(ctx: CanvasRenderingContext2D) {

        // Get number of bins in the level
        this.binCount = this.engine.tag.get(
            "CharacterBin", 
            "Level").length;

        // Get move counter
        this.counter = (
            this.engine.tag.get(
                "Counter", 
                "LevelInterface")[0] as Counter);

        // Get level sequence
        this.sequence = (
            this.engine.tag.get(
                "LevelSequence", 
                "Level")[0] as LevelSequence);

        // Get level scene
        this.level = this.engine.tag.getScene("Level");

        //Start level with starting board, unless this is the loading level
        if(Number(this.level?.tag.split("_").pop()) > 0) {
            this.openBoard(BoardType.START);
        }
    }

    /** Update board */
    public update(dt : number) {

        // Different board transitions
        switch(this.boardState) {

            // Open transition, move down
            case BoardState.OPEN : {

                    let boardObjectsCurr = this.boardSets[this.boardType].boardObjects;
                    let stopHeight = this.boardSets[this.boardType].stopHeight;

                    if(this.boardOffset.y < stopHeight) {
                        this.boardOffset.y += dt * this.boardSpeed;
                        boardObjectsCurr.forEach(o => o.gameObject.spos.y += dt * this.boardSpeed);
                    }
                    if(this.boardOffset.y >= stopHeight) {
                        boardObjectsCurr.forEach(o => o.gameObject.spos.y += stopHeight - this.boardOffset.y);
                        this.boardOffset.y = stopHeight;
                        
                        let autoCloseTime = this.boardSets[this.boardType].autoCloseTime;

                        if(autoCloseTime > 0) { 
                            this.autoCloseTimer += dt;
                            if(this.autoCloseTimer > autoCloseTime) {
                                this.closeBoard();
                            }
                        }
                    }

                    let offset = this.boardSets[this.boardType].offset;
                    let size = this.boardSets[this.boardType].size;

                    if (this.boardSets[this.boardType].pressExit &&
                        this.engine.mouse.mouseState == MouseState.WASRELEASED &&
                        colPointRect(
                            this.engine.mouse.pos.x,
                            this.engine.mouse.pos.y,
                            offset.x + this.boardOffset.x,
                            offset.y + this.boardOffset.y,
                            size.x,
                            size.y
                        )) {
                        
                        this.closeBoard();
                    }
                }
                break;

            // Close transition, move left then unpause
            case BoardState.CLOSE : {

                    let boardObjectsCurr = this.boardSets[this.boardType].boardObjects;

                    this.boardOffset.x -= dt * this.boardSpeed * 1.5;
                    boardObjectsCurr.forEach(o => o.gameObject.spos.x -= dt * this.boardSpeed * 1.5);
                    
                    if(this.boardOffset.x < -840) {
                        this.boardState = BoardState.OFF;
                        boardObjectsCurr.forEach(o => o.gameObject.isActive = false);

                        if(this.nextBoardType != null) {
                            this.openBoard(this.nextBoardType);
                            this.nextBoardType = null;
                        }
                        else {
                            this.level?.unpause();
                        }
                    }
                }
                break;
            }
    }

    /** Draw board */
    public draw(ctx : Board_CanvasRenderingContext2D) {

        if(this.boardState != BoardState.OFF) {

            ctx.translate(this.boardOffset.x, this.boardOffset.y);

            // Board text & non-objects
            switch(this.boardType) {

                case BoardType.HINT : {

                        ctx.fillStyle = "#111";
                        ctx.font = "32px Font04b_08";
                        ctx.fillText("Hint :", 272, -328);
                        wrapText(ctx, this.sequence?.hint ?? "", 556).forEach((l, i) => {
        
                            ctx.fillText(l, 272, -328 + i * 32 + 32);
                        });
                    }
                    break;
                
                case BoardType.WIN : {

                        ctx.fillStyle = "#FFF";
                        ctx.font = "64px Font04b_08";
                        ctx.fillText("level complete!", 194, -444);

                        ctx.fillStyle = "#111";
                        ctx.font = "32px Font04b_08";
                        ctx.fillText(`moves:${this.counter?.count}`, 190, -134);

                        ctx.fillStyle = "#555";
                        // Under par
                        if(this.counter?.underPar) {

                            ctx.fillText("gold award", 218, -100);
                            ctx.drawImage(this.gold, 193, -118);
                        }
                        // Over par
                        else {

                            ctx.font = "16px Font04b_08";
                            ctx.fillText(`beat this level in ${this.counter?.par} or fewer`, 190, -108);
                            ctx.fillText("moves to get the gold award.", 190, -92);
                        }
                    }
                    break;
                
                case BoardType.FAIL : {

                        ctx.fillStyle = "#FFF";
                        ctx.font = "64px Font04b_08";
                        ctx.fillText("OUCH!", 375, -310);

                        ctx.font = "32px Font04b_08";
                        ctx.fillText("Why me?", 375, -270);
                    }
                    break;
                
                case BoardType.START : {

                        let levelNumber = Number(this.level?.tag.split("_").pop());
                        let buildingNumber = Math.ceil(levelNumber / 15);

                        if (buildingNumber > 0 && buildingNumber <= this.buildings.length) {

                            ctx.drawImage(this.buildings[buildingNumber - 1], 312, -338);
                        }
                        
                        ctx.fillStyle = "#FFF";
                        ctx.font = "32px Font04b_08";
                        wrapText(ctx, `Level ${(levelNumber - 1) % 15 + 1}: ${this.sequence?.levelName}`, 500).forEach((l, i) => {
                            ctx.fillText(l, 313, -246 + i * 32 + 32);
                        });

                        ctx.letterSpacing = "4px";
                        ctx.scale(1.1, 1);
                        ctx.font = "60px FontStencil";
                        ctx.fillText(`BUILDING ${buildingNumber}`, 410, -255);
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

        //Prevent interuption
        if(this.boardState != BoardState.OFF) {

            // Hints cannot interupt other boards
            if(boardType == BoardType.HINT && this.boardType != BoardType.HINT) {
                return;
            }
    
            // Do not interupt a board sequence with itself
            if(boardType == this.boardType) {
                return;
            }
        }

        // Setup and activate board
        this.boardState = BoardState.OPEN;                      // Board starts by opening
        this.boardOffset = Vect.zero;                           // Reset board position
        this.boardType = boardType;                             // Set board type
        this.boardSets[boardType].boardObjects.forEach(oo => {  // Reset objects for this type
            oo.gameObject.isActive = true;
            oo.gameObject.spos = oo.offset.get;
        });
        this.level?.pause();                                    // Pause the level
    }

    /** Close the board, optionally setup another board type to open afterwards */
    public closeBoard(boardType? : BoardType) {

        this.boardState = BoardState.CLOSE;
        this.nextBoardType = boardType ?? null;
    }
}