import { TouchStyle } from "engine/modules/settings";
import { GMULTX, GMULTY, round, TOUCH_EFFECT_MAX, TOUCH_PUSH_OFFSET } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
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

        let snapOffset =
            this.isSnapped ?
            new Vect(
                round(this.spos.x, GMULTX) - this.spos.x,
                round(this.spos.y, GMULTY) - this.spos.y) :
            Vect.zero;

        let rand = Math.random();

        ctx.fillStyle = ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3 + rand * 2;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(0, 128, 255, 1)";
        ctx.shadowBlur = 8;

        //Line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(touchOffset.x + snapOffset.x, touchOffset.y + snapOffset.y);
        ctx.stroke();

        //Near circle
        ctx.beginPath();
        ctx.arc(
            0, 
            0, 
            8 + rand, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        //Far circle
        ctx.beginPath();
        ctx.arc(
            touchOffset.x + snapOffset.x, 
            touchOffset.y + snapOffset.y, 
            5 + rand, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        //Line again to remove shadow artifacts.
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(touchOffset.x + snapOffset.x, touchOffset.y + snapOffset.y);
        ctx.stroke();
    }
}