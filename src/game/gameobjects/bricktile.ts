import { Collider } from "engine/modules/collision";
import Brick, { BrickParams } from "./brick";

/** Parameters for a tile */
export interface BrickTileParams extends BrickParams {
    isOn?: boolean;                         // If the tile starts on or off
    images: (string | [string,string])[];   // Images for the tile on/off states
    circuit: number;                        // Circuit number that turns the tile on/off
}

/** A tile, a brick without studs */
export default class BrickTile extends Brick {

    protected isOn : boolean = false;       // If the effects for this
    protected images : HTMLImageElement[];  // Images for this tile
    public circuit : number;                // Curcuit for this tile, which can externally turn it on or off.

    /** Constructor */
    constructor(params: BrickTileParams) {
        super({...params, blockStrength : 2});

        this.tags.push("BrickTile");

        this.images = params.images.map(i => {
            return Array.isArray(i) ?
                this.engine.library.getImage(i[0], i[1]) as HTMLImageElement :
                this.engine.library.getImage(i) as HTMLImageElement;
        });

        this.isOn = params.isOn ?? true;
        this.image = this.images[+this.isOn];
        this.circuit = params.circuit;
    }

    /** Set the on/off state of this tile and set the current image to match */
    public setOnOff(state : boolean) {
        this.isOn = state;
        this.image = this.images[+this.isOn];
    }
}