import Scene from "engine/scene/scene";
import Button from "./button";
import LevelSequence from "./levelsequence";
import Signage from "./signage";

export default class ButtonHintOkay extends Button {

    /** */
    private signage : Signage | null = null;

    /** Initialize this scene button */
    public init(ctx: CanvasRenderingContext2D) {
        super.init(ctx);

        this.signage = this.engine.tag.get("Signage", "LevelInterface")[0] as Signage;
    }

    /** Scene button action */
    protected doButtonAction() {
        
        this.signage?.closeSign();
    }
}
