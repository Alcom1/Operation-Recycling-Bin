import { TouchStyle } from "engine/modules/settings";
import { GMULTY, TOUCH_EFFECT_MAX, TOUCH_PUSH_OFFSET } from "engine/utilities/math";
import MobileIndicator from "./mobileindicator";

/** Visual for picking up bricks with push touch */
export default class MobileBeam extends MobileIndicator {

    /** Draw this preview */
    public draw(ctx: CanvasRenderingContext2D) {
    
        if (this.engine.mouse.mouseType == "mouse" ||
            this.engine.settings.getNumber("touchStyle") != TouchStyle.PUSH ||
            !TOUCH_EFFECT_MAX.getLessOrEqual(this.size)) {
            return;
        }

        let touchOffset = 
            this.engine.mouse.off.getMult(
                TOUCH_PUSH_OFFSET +         // Baseline offset
                GMULTY / 2 * Math.max(      // Increase offset based on selection size
                    this.size.x, 
                    this.size.y));

        ctx.strokeStyle = "#3CF"
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(touchOffset.x, touchOffset.y);
        ctx.closePath();
        ctx.stroke();
    }
}