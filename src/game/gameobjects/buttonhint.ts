import Scene from "engine/scene/scene";
import Button from "./button";
import LevelSequence from "./levelsequence";
import Board from "./board";

export default class ButtonHint extends Button {

    /** */
    private board : Board | null = null;

    /** Initialize this scene button */
    public init(ctx: CanvasRenderingContext2D) {
        super.init(ctx);

        this.board = this.engine.tag.get("Board", "LevelInterface")[0] as Board;
    }

    /** Scene button action */
    protected doButtonAction() {
        
        this.board?.openBoard();
    }
}
