import Engine from "engine/engine";
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
    private cursorImages: Record<CursorIconState, string> = {
        [CursorIconState.NONE]:         "cursor_none",
        [CursorIconState.DRAG]:         "cursor_drag",
        [CursorIconState.CARRY]:        "cursor_carry",
        [CursorIconState.HOVER]:        "cursor_drag",
        [CursorIconState.HOVERDOWN]:    "cursor_down",
        [CursorIconState.HOVERUP]:      "cursor_up"
    };

    public constructor(engine: Engine, params: GameObjectParams) {
        super(engine, params);

        //Convert cursor image names to filepaths
        for (let key in this.cursorImages) {
            const key2 = Number(key) as CursorIconState;
            this.cursorImages[key2] = pathImg(this.cursorImages[key2]);
        }

        this.setCursor(CursorIconState.NONE);
    }

    /** Sets the cursor to match the provided state */
    public setCursor(state: CursorIconState): void {
        this.engine.mouse.setCursorURL(this.cursorImages[state]);
    }
}