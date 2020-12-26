// Constants
/** Horizontal multiplier for grid positions */
export const GMULTX = 30;
/** Vertical multiplier for grid positions */
export const GMULTY = 36;
/** Z-index to place objects beneath the cursor */
export const UNDER_CURSOR_Z_INDEX = 100;
/** Thickness of lines */
export const LINE_WIDTH = 2;
/** Radius of studs */
export const STUD_RADIUS = 11;
/** Height of studs */
export const STUD_HEIGHT = 6;
/** Distance to draw depth */
export const Z_DEPTH = 22;

/** Environment boundary */
export const BOUNDARY = Object.freeze({
    /** Minimum X-position */
    minx: 0,
    /** Minimum Y-position */
    miny: 2,
    /** Maximum X-position */
    maxx: 35,
    /** Maximum Y-position */
    maxy: 24
});

/** Constrain value between min and max (inclusive) */
export function clamp(val: number, min: number, max: number): number {

    return Math.max(min, Math.min(max, val));
}

/** Round a value to the nearest target */
export function round(val: number, target: number): number {
    return Math.round(val / target) * target;
}

/** Collision between a bar and a bounding box but with grid coordinates */
export function colBorderBoxGrid(x: number, y: number, w: number): boolean {
    return (
        x <          BOUNDARY.minx ||   // Lower horizontal bound
        y <          BOUNDARY.miny ||   // Lower vertical bound
        x + w - 1 >= BOUNDARY.maxx ||   // Upper horiziontal bound with width
        y >=         BOUNDARY.maxy      // Upper vertical bound
    );
}

/** Point-rectangle collision */
export function colPointRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
    return (
        px >= rx      &&    // Lower horizontal bound
        py >= ry      &&    // Lower vertical bound
        px <  rx + rw &&    // Upper horizontal bound
        py <  ry + rh       // Upper vertical bound
    );
}

/** Point-rectangle collision but with grid coordinates */
export function colPointRectGrid(px: number, py: number, rx: number, ry: number, rw: number): boolean {
    return colPointRect(
        px,            // Point-X
        py,            // Point-y
        rx * GMULTX,   // Rect-x
        ry * GMULTY,   // Rect-y
        rw * GMULTX,   // Rect-width
        GMULTY         // Assume height = 1
    );
}

/** Point-parallelogram (Horizontal) collision */
export function colPointParH(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
    return (
        px >= rx      - py + ry &&  //Horizontal tilt
        py >= ry                &&
        px <  rx + rw - py + ry &&  //Horizontal tilt
        py <  ry + rh
    );
}

/** Point-parallelogram (Horizontal) collision but with grid coordinates */
export function colPointParHGrid(px: number, py: number, rx: number, ry: number, rw: number): boolean {
    return colPointParH(
        px,                     //Point-X
        py,                     //Point-y
        rx * GMULTX + Z_DEPTH,  //Para-x
        ry * GMULTY - Z_DEPTH,  //Para-y
        rw * GMULTX,            //Para-width
        Z_DEPTH                 //Para-height
    );
}

/** Point-parallelogram (Vertical) collision */
export function colPointParV(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
    return (
        px >= rx                &&
        py >= ry      - px + rx &&  // Vertical tilt
        px <  rx + rw           &&
        py <  ry + rh - px + rx     // Vertical tilt
    );
}

/** Point-parallelogram (Vertical) collision but with grid coordinates */
export function colPointParVGrid(px: number, py: number, rx: number, ry: number, rw: number): boolean {
    return colPointParV(
        px,                         // Point-X
        py,                         // Point-y
        rx * GMULTX + rw * GMULTX,  // Para-x
        ry * GMULTY,                // Para-y
        Z_DEPTH,                    // Para-width
        GMULTY                      // Para-height
    );
}

/** 1-dimensional collision to check vertical overlap */
export function col1D(a1: number, a2: number, b1: number, b2: number): boolean {
    // Return if A and B objects overlap
    return a2 > b1 && a1 < b2;
}

/** Translate text colors to custom values */
export function colorTranslate(color?: string): string {
    switch (color){
        case undefined: return '#999999'    // No color translates to grey
        case 'white':   return '#EEEEEE'
        case 'blue' :   return '#0033FF'
        case 'yellow':  return '#FFCC00'
        case 'red':     return '#CC0000'
        case 'black':   return '#333344'
        case 'grey':    return '#808080'
        case 'green':   return '#008000'
        default:
            if (color.startsWith('#')) return color;
            else throw new Error(`No color definition available for color '${color}'`);
    }
}

/** Multiply by a value all channels in a hex color */
export function colorMult(color: string, value: number): string {
    return colorChange(
        color,             // Color to be modified
        value,             // Value to apply to this color
        (c, v) => c * v    // Multiplicative function
    );
}

/** Add a value to all channels in a hex color */
export function colorAdd(color: string, value: number): string {

    return colorChange(
        color,             // Color to be modified
        value,             // Value to apply to this color
        (c, v) => c + v    // Additive function
    );
}

/** Modify a color given a value and modifier function */
export function colorChange(color: string, value: number, func: (color: number, value: number) => number): string {
    // Array of individual color channels
    let channels = [];
    // There are THREE channels.
    for (let i = 0; i < 3; i++) {
        // For each channel, store its digits in the channels
        channels[i] = parseInt(color.substr(2 * i + 1, 2), 16);
    }

    // Convert to decimal and apply function
    channels = channels.map(c => clamp(Math.round(func(c, value)), 0, 255));
    // Convert back to 2-digit hex
    channels = channels.map(c => ("0" + c.toString(16)).substr(-2));

    // Return recomposed color
    return "#" + channels.join('');
}
