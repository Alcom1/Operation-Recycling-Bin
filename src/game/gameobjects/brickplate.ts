import Engine from "engine/engine";
import { Collider } from "engine/modules/collision";
import Brick, { BrickParams } from "./brick";

export interface BrickPlateParams extends BrickParams {
    isOn: boolean;
    images: string[];
}

export default class BrickPlate extends Brick {

    protected isOn : boolean;
    private images : HTMLImageElement[];

    constructor(engine: Engine, params: BrickPlateParams) {
        super(engine, Object.assign(params, { width : 4 }));

        this.images = params.images.map(i => i ? this.engine.library.getImage(i) : {} as HTMLImageElement);

        this.isOn = params.isOn;
        this.image = this.images[+params.isOn];
    }

    //Get passive collider of this brick.
    public getColliders() : Collider[] {
        return [{ 
            mask : 0,               //Passive
            min : this.gpos.getAdd({ x : 0,              y : -1}),
            max : this.gpos.getAdd({ x : this.width,     y :  2}) 
        }];
    }
}