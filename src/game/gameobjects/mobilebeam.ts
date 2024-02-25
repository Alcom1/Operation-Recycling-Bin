import { TouchStyle } from "engine/modules/settings";
import { GMULTX, GMULTY, round, TOUCH_EFFECT_MAX, TOUCH_PUSH_OFFSET } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import MobileIndicator from "./mobileindicator";

/** Visual for picking up bricks with push touch */
export default class MobileBeam extends MobileIndicator {

    /** Draw this preview */
    public draw(ctx: CanvasRenderingContext2D) {
    
        //Only display on mobile with push touch-style.
        if (this.engine.mouse.mouseType == "mouse" ||
            this.engine.settings.getNumber("touchStyle") != TouchStyle.PUSH ||
            !TOUCH_EFFECT_MAX.getLessOrEqual(this.size)) {

            return;
        }

        //Offset of the selection
        let touchOffset = 
            this.engine.mouse.off.getMult(
                TOUCH_PUSH_OFFSET +         // Baseline offset
                GMULTY / 2 * Math.max(      // Increase offset based on selection size
                    this.size.x, 
                    this.size.y));

        //Boundary offset
        let boundaryOffset = this.spos.getSub(
            this.getBoundaryClamp(
                new Vect(
                    GMULTX * this.size.x / 2, 
                    GMULTY * this.size.y / 2).getAdd(touchOffset.getMult(-1))));

        //Modifiers for snap offset based on its size and distance
        let xEvenMod = (this.size.x % 2 == 0 ? 0 : GMULTX / 2);
        let yEvenMod = (this.size.y % 2 == 0 ? 0 : GMULTY / 2) + touchOffset.y % GMULTY;

        //Additional offset of the selection if it's snapped, otherwise it's zero.
        let snapOffset =
            this.isSnapped ?
            new Vect(
                boundaryOffset.x ? 0 : round(this.spos.x + xEvenMod, GMULTX) - this.spos.x - xEvenMod,
                boundaryOffset.y ? 0 : round(this.spos.y + yEvenMod, GMULTY) - this.spos.y - yEvenMod) :
            Vect.zero;

        //All of the offsets combined
        let combinedOffset = touchOffset.getSub(boundaryOffset).getAdd(snapOffset);
        let ringSize = 50;
        let lineStart = combinedOffset.norm.getMult(ringSize + 1);

        //Canvas style for beam
        let rand = Math.random();
        ctx.fillStyle = ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3 + rand * 2;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(0, 128, 255, 1)";
        ctx.shadowBlur = 8;

        //Line
        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(combinedOffset.x, combinedOffset.y);
        ctx.stroke();

        //Near circle
        ctx.beginPath();
        ctx.arc(
            0, 
            0, 
            ringSize + rand, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();

        //Far circle
        ctx.beginPath();
        ctx.arc(
            combinedOffset.x, combinedOffset.y,
            5 + rand, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        //Line again to remove overlapping shadow artifacts.
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(combinedOffset.x, combinedOffset.y);
        ctx.stroke();
    }
}