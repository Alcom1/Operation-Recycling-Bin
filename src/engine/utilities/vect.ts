export interface Point {
    x: number;
    y: number;
}

function isPoint(vect: any | Point): vect is Point {

    return vect.x !== undefined && vect.y !== undefined;
}

/** Vector class */
export default class Vect implements Point {

    /** Constructor */
    constructor(public x: number, public y: number) {}

    /** Returns a copy of this vector */
    public get(): Vect {

        return new Vect(this.x, this.y);
    }

    /** Sets the individual components */
    public set(x: number, y: number): void;
    public set(vect: Point): void;
    public set(a: number| Point, b?: number): void {

        if (isPoint(a)) {
            this.x = a.x;
            this.y = a.y;
        } 
        else {
            if (b === undefined) throw new Error("Vector y can't be undefined");
            this.x = a;
            this.y = b;
        }
    }

    /** Get if two vectors have different values */
    public getDiff(vect: Point) {

        return vect.x != this.x || vect.y != this.y;
    }

    /** Get if both components of a vector are less than or equal to this one's */
    public getLessOrEqual(vect: Point) : boolean {

        return vect.x <= this.x && vect.y <= this.y;
    }

    /** Add another vector to this */
    public add(vect: Point): void {

        this.x += vect.x;
        this.y += vect.y;
    }

    /** Returns the sum of this and another vector */
    public getAdd(vect: Point): Vect {

        return new Vect(this.x + vect.x, this.y + vect.y);
    }

    /** Subtracts a vector from this */
    public sub(vect: Point): void {

        this.x -= vect.x;
        this.y -= vect.y;
    }

    /** Returns the difference of this and another vector */
    public getSub(vect: Point): Vect {

        return new Vect(this.x - vect.x, this.y - vect.y);
    }

    /** Multiplies the components of this by a single or separate values */
    public mult(value: number, valueY?: number): void {

        this.x *= value;
        this.y *= valueY == null ? value : valueY;
    }
    
    /** Returns a new vector with the components multiplied by a single or separate values */
    public getMult(value: number, valueY?: number): Vect {

        return new Vect(
            this.x * value, 
            this.y * (valueY == null ? value : valueY));
    }

    /** Returns a new vector with the components divided by a single or separate values */
    public div(value: number, valueY?: number): void {

        this.x /= value;
        this.y /= valueY == null ? value : valueY;
    }

    /** Returns a new vector with the components divided by a single or separate values */
    public getDiv(value: number, valueY?: number): Vect {

        return new Vect(
            this.x / value, 
            this.y / (valueY == null ? value : valueY));
    }

    /** Restricts the components to be inside a range defined by a minimum and a maximum */
    public clamp(min: Point, max: Point): void {

        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
    }

    /** Returns the components, restricted inside a range defined by a minimum and a maximum */
    public getClamp(min: Point, max: Point): Vect {

        return new Vect(
            Math.max(min.x, Math.min(max.x, this.x)),
            Math.max(min.y, Math.min(max.y, this.y))
        );
    }

    /** Returns the dot-product with another vector */
    public getDot(value: Point): number {

        return this.x * value.x + this.y * value.y;
    }

    /** Returns the dot-product with another vector */
    public getCross(value: Point): number {

        return this.x * value.y - this.y * value.x;
    }

    /** Normalizes this vector */
    public norm(): void {

        let length = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x /= length;
        this.y /= length;
    }

    /** Returns a normalized copy of this vector */
    public getNorm() {

        let length = Math.sqrt(this.x * this.x + this.y * this.y);
        if(length) {
            return new Vect(this.x / length, this.y / length);
        }
        else {
            return Vect.zero;
        }
    }

    /** Returns the magnitude of this vector */
    public getMagnitude(): number {

        return Math.sqrt(this.getMagnitudeSquared());
    }

    /** Returns the squared magnitude of this vector */
    public getMagnitudeSquared(): number {

        return this.x * this.x + this.y * this.y;
    }

    /** Limits the magnitude to a maximum value */
    public limit(maxMagnitude : number) {
        
        if(this.getMagnitudeSquared() > maxMagnitude * maxMagnitude) {
            this.norm();
            this.mult(maxMagnitude);
        }
    }

    /** Sets this vector to zero */
    public setToZero(): void {

        this.x = 0;
        this.y = 0;
    }

    /** A new zero'd vector */
    public static get zero() : Vect {

        return new Vect(0, 0);
    }
}
