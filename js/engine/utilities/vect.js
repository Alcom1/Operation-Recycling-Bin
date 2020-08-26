//Vector constructor
var Vect = function(x, y) {
    
    this.x = x;
    this.y = y;
}

//Vector prototype
Vect.prototype = {

    //Returns this vector
    get : function() {

        return new Vect(this.x, this.y, 0);
    },

    //Sets the values of this vector
    set : function(a, b) {

        if(b != null) {

            this.x = a;
            this.y = b;
        }
        else {

            this.x = a.x;
            this.y = a.y;
        }
    },

    //Get if two vectors have different values
    getDiff : function(vect) {
        
        return vect.x != this.x || vect.y != this.y;
    },

    //Vector addition
    add : function(vect) {

        this.x += vect.x;
        this.y += vect.y;
    },

    //Vect get addition result
    getAdd : function(vect) {

        return new Vect(
            this.x + vect.x,
            this.y + vect.y);
    },

    //Vector subtraction
    sub : function(vect) {

        this.x -= vect.x;
        this.y -= vect.y;
    },

    //Vect get subtraction result
    getSub : function(vect) {

        return new Vect(
            this.x - vect.x,
            this.y - vect.y);
    },

    //Vector multiplication
    mult : function(value) {

        this.x *= value;
        this.y *= value;
    },

    //Vect get multiplication result
    getMult : function(value) {

        return new Vect(
            this.x * value,
            this.y * value);
    },

    //Vector division
    div : function(value) {

        this.x /= value;
        this.y /= value;
    },

    //Vect get division result
    getDiv : function(value) {

        return new Vect(
            this.x / value,
            this.y / value);
    },

    //Return dot product with another vector
    getDot : function(value) {

        return this.x * value.x + this.y * value.y;
    },

    //Return cross product with another vector
    getCross : function(value) {

        return this.x * value.y - this.y * value.x;
    },

    //Vector normalization
    norm : function() {

        var length = Math.sqrt(
            this.x * this.x + 
            this.y * this.y);
        this.x /= length;
        this.y /= length;
    },

    //Vector get normalization result
    getNorm : function() {

        var length = Math.sqrt(
            this.x * this.x + 
            this.y * this.y);
        return new Vect(
            this.x / length,
            this.y / length);
    },

    //Get magnitude of the vector.
    getMagnitude : function() {

        return Math.sqrt(this.getMagnitudeSquared());
    },

    //Vector length squared
    getMagnitudeSquared : function() {

        return this.x * this.x + this.y * this.y;
    }
}