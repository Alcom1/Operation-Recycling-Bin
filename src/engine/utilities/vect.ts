export interface Point {
    x: number;
    y: number;
}

function isPoint(vect: any | Point): vect is Point {
    return vect.x !== undefined && vect.y !== undefined;
}

export default class Vect implements Point {
    constructor(public x: number, public y: number) {}

    public get(): Vect {
        return new Vect(this.x, this.y);
    }

    public set(x: number, y: number): void;
    public set(vect: Point): void;
    public set(a: number| Point, b?: number): void {
        if (isPoint(a)) {
            this.x = a.x;
            this.y = a.y;
        } else {
            if (b === undefined) throw new Error("Vector y can't be undefined");
            this.x = a;
            this.y = b;
        }
    }

    /** Get if two vectors have different values */
    public getDiff(vect: Point) {
        return vect.x != this.x || vect.y != this.y;
    }

    public add(vect: Point): void {
        this.x += vect.x;
        this.y += vect.y;
    }

    public getAdd (vect: Point): Vect {
        return new Vect(this.x + vect.x, this.y + vect.y);
    }

    public sub(vect: Point): void {
        this.x -= vect.x;
        this.y -= vect.y;
    }

    public getSub(vect: Point): Vect {
        return new Vect(this.x - vect.x, this.y - vect.y);
    }

    public mult(value: number): void {
        this.x *= value;
        this.y *= value;
    }

    public getMult(value: number): Vect {
        return new Vect(this.x * value, this.y * value);
    }

    public div(value: number): void {
        this.x /= value;
        this.y /= value;
    }

    public getDiv(value: number): Vect {
        return new Vect(this.x / value, this.y / value);
    }

    public clamp(min: Point, max: Point): void {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
    }

    public getClamp(min: Point, max: Point): Vect {
        return new Vect(
            Math.max(min.x, Math.min(max.x, this.x)),
            Math.max(min.y, Math.min(max.y, this.y))
        );
    }

    public getDot(value: Point): number {

        return this.x * value.x + this.y * value.y;
    }

    public getCross(value: Point): number {
        return this.x * value.y - this.y * value.x;
    }

    public norm(): void {
        var length = Math.sqrt(this.x * this.x + this.y * this.y);
        this.x /= length;
        this.y /= length;
    }
    
    public getNorm() {
        var length = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Vect(this.x / length, this.y / length);
    }

    public getMagnitude(): number {
        return Math.sqrt(this.getMagnitudeSquared());
    }

    public getMagnitudeSquared(): number {
        return this.x * this.x + this.y * this.y;
    }
}
