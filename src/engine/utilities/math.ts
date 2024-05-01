// Constants

import Vect, { Point } from "./vect";

/** Path to image assets */
export const PATH_IMG = "img/";
/** Horizontal multiplier for grid positions */
export const GMULTX = 30;
/** Vertical multiplier for grid positions */
export const GMULTY = 36;
/** Distance to draw depth */
export const Z_DEPTH = 22;
/** Width of the sidepanel UI */
export const WIDTH_SIDEPANEL = 234;
/** Array of unit and negative unit for opposed functions */
export const OPPOSITE_DIRS = [-1, 1] as (-1 | 1)[];
/** Maximum size of a selection that induces touch effects */
export const TOUCH_EFFECT_MAX = new Vect(3, 3);
/** Baseline offset of the push touch effect */
export const TOUCH_PUSH_OFFSET = GMULTY * 3;

/** Faction reference enum */
export const enum Faction {
    SWISS,
    FRIENDLY,
    NEUTRAL,
    HOSTILE
}

/** Returns true if factions are not opposing */
export function MatchFactions(a : Faction, b : Faction) : boolean {

    return (
        a == b ||               // Same factions always match
        a == Faction.NEUTRAL || // Neutral matches with everything
        b == Faction.NEUTRAL)   // Neutral matches with everything
}

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

export const MASKS = Object.freeze({
    block: 0b1,
    scrap: 0b10,
    death: 0b100,
    zappy: 0b1000,
    float: 0b10000,
    super: 0b100000,
    water: 0b1000000,
    jumps: 0b10000000,
    press: 0b100000000,
    enemy: 0b1000000000,
})

// 4x4 Collision bitmasks
// 0123
// 4  5
// 6  7
// 89AB
export const RING_BITSTACK = Object.freeze({
    flor : bitStack(9, 10),
    roof : bitStack(1, 2),
    face : bitStack(5, 7),
    back : bitStack(4, 6),
    land : bitStack(11),
    band : bitStack(8)
});

/** Handles file extension - image */
export function nameImg(fileName : string, extension?: string) {

    return `${fileName}.${extension ?? "png"}`;    // Default to png
}

/** Handles file extension - image */
export function pathImg(fileName : string, extension?: string) {

    return `${PATH_IMG}${nameImg(fileName,extension)}`;
}

/** Constrain value between min and max (inclusive) */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

/** Round a value to the nearest target */
export function round(val: number, target: number): number {
    return Math.round(val / target) * target;
}

/** Floor a value to the nearest target */
export function floor(val: number, target: number): number {
    return Math.floor(val / target) * target;
}

/** Zipper an integer (0, 1, 2, 3) => (-1, 1, -2, 2) or 0 if negative */
export function zip(val: number) {
    return val >= 0 ? OPPOSITE_DIRS[val % 2] * Math.ceil((val + 1) / 2) : 0
}

/** Stack an array of integers into a bitmask */
export function bitStack(...numbers: number[]): number {

    let ret = 0;
    numbers.forEach(n => ret += 1 << n);
    return ret;
}

/** Check if a box is inside a bounding box */
export function colBoundingBoxGrid(min: Point, max: Point): boolean {
    return (
        min.x <  BOUNDARY.minx     ||   // Lower horizontal bound
        min.y <  BOUNDARY.miny     ||   // Lower vertical bound
        max.x >= BOUNDARY.maxx + 1 ||   // Upper horiziontal bound
        max.y >= BOUNDARY.maxy + 1      // Upper vertical bound
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

/** Rectangle-rectangle collision with two size rectangles */
export function colRectRectSizes(
    apos : Vect,
    adim : Point,
    bpos : Vect,
    bdim : Point) : boolean {

    return colRectRectCorners(
        apos,
        apos.getAdd(adim),
        bpos,
        bpos.getAdd(bdim))
}

/** Rectangle-rectangle collision with a corner and size rectangle */
export function colRectRectCornerSize(
    amin : Point,
    amax : Point,
    bpos : Vect,
    bdim : Point) : boolean {

    return colRectRectCorners(
        amin,
        amax,
        bpos,
        bpos.getAdd(bdim))
}

/** Rectangle-rectangle collision with two corner rectangles */
export function colRectRectCorners(    
    amin : Point,
    amax : Point,
    bmin : Point,
    bmax : Point) : boolean {

    return (
        amin.x < bmax.x &&
        amax.x > bmin.x &&
        amin.y < bmax.y &&
        amax.y > bmin.y);
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
        px >= rx      - py + ry &&  // Horizontal tilt
        py >= ry                &&
        px <  rx + rw - py + ry &&  // Horizontal tilt
        py <  ry + rh
    );
}

/** Point-parallelogram (Horizontal) collision but with grid coordinates */
export function colPointParHGrid(px: number, py: number, rx: number, ry: number, rw: number): boolean {
    return colPointParH(
        px,                     // Point-X
        py,                     // Point-y
        rx * GMULTX + Z_DEPTH,  // Para-x
        ry * GMULTY - Z_DEPTH,  // Para-y
        rw * GMULTX,            // Para-width
        Z_DEPTH                 // Para-height
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

/** 1-dimensional check to measure vertical overlap */
export function gap1D(a1: number, a2: number, b1: number, b2: number): number {
    // Return gap size between two ranges (negative if overlap)
    if(a1 > a2) { [a1, a2] = [a2, a1] };    // Fix order for proper +/-
    if(b1 > b2) { [b1, b2] = [b2, b1] };    // Fix order for proper +/-
    return Math.abs(b1 - a2) < Math.abs(a1 - b2) ? (b1 - a2) : (a1 - b2);
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

/** Measure and wrap text into array of strings */
export function wrapText(ctx: CanvasRenderingContext2D, text : string, width : number) : string[] {

    let start = 0;                                  // Start of current segment
    let lines : string[] = [];                      // Lines of text

    let spaces = [0, ...text]                       // Text to character array
        .map((c, i) => { return {c : c, i : i} })   // Character-index pairs
        .filter(ci => ci.c == " ")                  // Pairs that are spaces
        .map(ci => ci.i);                           // Indicies only
    let spaceIndex = 1;                             // Index of current space being checked

    // Test each space and the resulting length for a new line
    while(spaceIndex < spaces.length) {

        // Get next substring to test
        let testLine = text.substr(spaces[start], spaces[spaceIndex] - spaces[start]).trim();

        // If test line exceeds length, add new line
        if(ctx.measureText(testLine).width >= width) {

            lines.push(testLine.substr(         // Next line
                0, 
                testLine.lastIndexOf(" ")));    // Go back one word
            start = spaceIndex - 1;             // Start one word behind
        }
        // Otherwise, increment for next text
        else {
            spaceIndex++;
        }
    }

    // Add remaining text as a final line
    lines.push(text.substr(spaces[start], text.length - 1));

    return lines;
}
