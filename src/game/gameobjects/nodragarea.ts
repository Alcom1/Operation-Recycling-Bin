import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { MouseState } from "engine/modules/mouse";
import Vect from "engine/utilities/vect";

/** An area that can be pressed, but disables dragging actions */
export default class NoDragArea extends GameObject {

    /** If this area was pressed */
    private wasPressed : boolean = false;

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);
    }

    /** Default check if point is in area, always false */
    protected checkArea(pos : Vect) : boolean {

        return false;
    }

    /** Check if point is in press area, press if so, return if this area is being pressed */
    public press(pos : Vect, state : MouseState) : boolean {

        this.wasPressed = false;

        if(this.checkArea(pos)) {

            //Is still being pressed, return true, don't reset this's state
            if(state == MouseState.ISPRESSED) {
                return true;
            }
            //Was just pressed, return true, reset this's state
            else if (state == MouseState.WASPRESSED) {
                this.wasPressed = true;
            }
        }

        return this.wasPressed;
    }

    /** Consume this area, set it to unpressed and return its previous pressed state */
    public consume() : boolean {

        let temp = this.wasPressed;
        this.wasPressed = false;
        return temp;
    }
}