import { GameObjectParams } from "engine/gameobjects/gameobject";
import Vect from "engine/utilities/vect";
import NoDragArea from "./nodragarea";

export interface NoDragCircleParams extends GameObjectParams {
    radius : number;
}

/** An area that can be pressed, but disables dragging actions */
export default class NoDragCircle extends NoDragArea {

    private radius : number;    //Radius of this circle

    /** Constructor */
    constructor(params: NoDragCircleParams) {
        super(params);

        this.radius = params.radius;
    }

    /** Check if point is inside circle */
    protected checkArea(pos : Vect) : boolean {

        return pos.getSub(this.spos).magnitudeSquared < this.radius * this.radius
    }
}