import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { pathImg } from "engine/utilities/math";

export enum CursorIconState {
    NONE,
    DRAG,
    CARRY,
    HOVER,
    HOVERDOWN,
    HOVERUP
}

export default class CursorIcon extends GameObject {

    /** Set of cursor images for each cursor state */
    private cursorImages: Map<CursorIconState, string> = new Map<CursorIconState, string>([
        [CursorIconState.NONE,      "cursor_none"],
        [CursorIconState.DRAG,      "cursor_drag"],
        [CursorIconState.CARRY,     "cursor_carry"],
        [CursorIconState.HOVER,     "cursor_drag"],
        [CursorIconState.HOVERDOWN, "cursor_down"],
        [CursorIconState.HOVERUP,   "cursor_up"]
    ]);
    public constructor(params: GameObjectParams) {
        super(params);
        
        //Convert cursor image names to filepaths
        this.cursorImages.forEach((v, k) => this.cursorImages.set(k, pathImg(v)));

        this.setCursor(CursorIconState.NONE);
    }

    /** Sets the cursor to match the provided state */
    public setCursor(state: CursorIconState): void {
        this.engine.mouse.setCursorURL(this.cursorImages.get(state));
    }
}