import { Collider } from "engine/modules/collision";
import Brick, { BrickParams } from "./brick";

export interface BrickPlateParams extends BrickParams {
    isOn: boolean;
    images: string[];
}

export default class BrickPlate extends Brick {

    protected isOn : boolean = false;
    protected images : HTMLImageElement[];

    constructor(params: BrickPlateParams) {
        super(params);

        this.images = params.images.map(i => i ? this.engine.library.getImage(i) : {} as HTMLImageElement);

        this.isOn = params.isOn;
        this.image = this.images[+this.isOn];
    }

    //Set the on/off state of this plate
    protected setOnOff(state : boolean) {
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