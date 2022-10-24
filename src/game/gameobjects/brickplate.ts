import { Collider } from "engine/modules/collision";
import Brick, { BrickParams } from "./brick";

export interface BrickPlateParams extends BrickParams {
    isOn?: boolean;     //If the plate starts on or off
    images: string[];   //Images for the plate on/off states
    circuit: number;    //Circuit number that turns the plate on/off
}

export default class BrickPlate extends Brick {

    protected isOn : boolean = false;
    protected images : HTMLImageElement[];
    public circuit : number;

    /** Constructor */
    constructor(params: BrickPlateParams) {
        super(params);

        this.tags.push("BrickPlate");

        this.images = params.images.map(i => i ? this.engine.library.getImage(i) : {} as HTMLImageElement);

        this.isOn = params.isOn ?? true;
        this.image = this.images[+this.isOn];
        this.circuit = params.circuit;
    }

    //Set the on/off state of this plate
    public setOnOff(state : boolean) {
        this.isOn = state;
        this.image = this.images[+this.isOn];
    }

    //Get passive collider of this brick.
    public getColliders() : Collider[] {
        return !this.isGrey || this.isSelected ? [] : [{ 
            mask : 0,               //Passive
            min : this.gpos.getAdd({ x : 0,              y : -1}),
            max : this.gpos.getAdd({ x : this.width,     y :  2}) 
        }];
    }
}