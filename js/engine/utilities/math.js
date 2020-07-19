//constrained between min and max (inclusive)
function clamp(val, min, max) {

	return Math.max(min, Math.min(max, val));
}

//Maps x within range a-b to range c-d
function map(x, a, b, c, d) {

    return (x - a) / (b - a) * (d - c) + c;
}