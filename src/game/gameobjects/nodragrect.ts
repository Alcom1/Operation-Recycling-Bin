import { GameObjectParams } from "engine/gameobjects/gameobject";
import { col1D } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import NoDragArea from "./nodragarea";

export interface NoDragRectParams extends GameObjectParams {
    size : Point
}

/** An area that can be pressed, but disables dragging actions */
export default class NoDragRect extends NoDragArea {

    private size : Point;   //Size of rectangle

    /** Constructor */
    constructor(params: NoDragRectParams) {
        super(params);

        this.size = params.size;
    }

    /** Check if point is inside rectangle */
    protected checkArea(pos : Vect) : boolean {

        return (
            col1D(pos.x, pos.x, this.spos.x, this.spos.x + this.size.x) &&
            col1D(pos.y, pos.y, this.spos.y, this.spos.y + this.size.y))
    }
}