export class Vector3{
    /** @type {number}*/x = 0;
    /** @type {number}*/y = 0;
    /** @type {number}*/z = 0;
    constructor(/** @type {number}*/x,/** @type {number}*/y,/** @type {number}*/z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
    *Adds 2 Vector3's together
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns a Vector3 with the inputs added together
    *
    * @example 
    *const pos1 = new Vector3(1, 1, 1);
    *const pos2 = new Vector3(0, 1, 0);
    *
    *let addedValue = Vector3.Add(pos1, pos2); // Returns new Vector3(1, 2, 1)
    */
    static Add(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return new Vector3(pos1.x + pos2.x, pos1.y + pos2.y, pos1.z + pos2.z);
    }
        /**
    * Gets the absolute value of a number.
    * @param {number} value - The number to get the absolute value of.
    * @returns {number} - The absolute value of the input number.
    * @example
    * const negativeVal = -10;
    * let positiveVal = Mathf.Abs(negativeVal);  // Returns 10
    */
static Abs(value){
    return Math.abs(value);
}
    /**
    *Subtracts a Vector3 from another Vector3
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns a Vector3 with pos1's values subtracted by pos2's values
    *
    * @example 
    *const pos1 = new Vector3(1, 1, 1);
    *const pos2 = new Vector3(0, 1, 0);
    *
    *let subtractedValue = Vector3.Subtract(pos1, pos2); // Returns new Vector3(1, 0, 1)
    */
    static Subtract(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return new Vector3(pos1.x - pos2.x, pos1.y - pos2.y, pos1.z - pos2.z);
    }
    /**
    *Divides a Vector3 by another Vector3
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns a Vector3 with pos1's values divided by pos2's values
    *
    * @example 
    *const pos1 = new Vector3(2, 2, 2);
    *const pos2 = new Vector3(4, 4, 4);
    *
    *let dividedValue = Vector3.Divide(pos1, pos2); // Returns new Vector3(0.5, 0.5, 0.5)
    */
    static Divide(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return new Vector3(pos1.x / pos2.x, pos1.y / pos2.y, pos1.z / pos2.z);
    }
    /**
    *Multiplies a Vector3 with a number
    *@param pos1
    *The first Vector3
    *@param scale
    *The Number
    *@return
    *Returns a Vector3 with pos1's values multiplied by the scale
    *
    * @example 
    *const pos1 = new Vector3(1, 1, 1);
    *const scale = 5
    *
    *let multipliedValue = Vector3.Scale(pos1, scale); // Returns new Vector3(5, 5, 5)
    */
    static Scale(/** @type {Vector3}*/pos1, /** @type {Vector3}*/num){
        return new Vector3(pos1.x * num, pos1.y * num, pos1.z * num);
    }
    /**
    *Multiplies 2 Vector3's
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns a Vector3 with the inputs multiplied
    *
    * @example 
    *const pos1 = new Vector3(1, 1, 1);
    *const pos2 = new Vector3(0, 2, 0);
    *
    *let multipliedValue = Vector3.Multiply(pos1, pos2); // Returns new Vector3(0, 2, 0)
    */
    static Multiply(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return new Vector3(pos1.x * pos2.x, pos1.y * pos2.y, pos1.z * pos2.z);
    }
    /**
    *Checks if 2 Vector3s are the same
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@param tolerance
    *The range that the floats can differ
    *@return
    *Returns true if the Vector3's are the same otherwise it will return false
    *
    * @example 
    *const pos1 = new Vector3(0, 0, 1);
    *const pos2 = new Vector3(0, 0, 1.05);
    *
    *let check = Vector3.Equals(pos1, pos2, 0.1); // Returns true
    */
    static Equals(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2, /**@type {number}*/ tolerance){
        if (tolerance == undefined){
            if (pos1.x == pos2.x && pos1.y == pos2.y && pos1.z == pos2.z){
                return true;
            }
            else{
                return false;
            }
        }
        else{
            return Math.abs(pos1.x - pos2.x) <= tolerance && Math.abs(pos1.y - pos2.y) <= tolerance && Math.abs(pos1.z - pos2.z) <= tolerance;
        }
    }

    /**
    *Returns a Vector3 at 0, 0, 0
    * @example 
    *let pos = Vector3.Zero(); // pos = new Vector3(0,0,0)
    */
    static Zero(){
        return new Vector3(0,0,0);
    }
    /**
    *Returns a Vector3 at 0, 1, 0
    * @example 
    *let pos = Vector3.Up(); // pos = new Vector3(0,1,0)
    */
    static Up(){
        return new Vector3(0,1,0);
    }
    /**
    *Returns a Vector3 at 0, -1, 0
    * @example 
    *let pos = Vector3.Down(); // pos = new Vector3(0,-1,0)
    */
    static Down(){
        return new Vector3(0,-1,0);
    }
    /**
    *Returns a Vector3 at 0, 0, 1
    * @example 
    *let pos = Vector3.Forward(); // pos = new Vector3(0,0,1)
    */
    static Forward(){
        return new Vector3(0,0,1);
    }
    /**
    *Returns a Vector3 at 0, 0, -1
    * @example 
    *let pos = Vector3.Back(); // pos = new Vector3(0,0,-1)
    */
    static Back(){
        return new Vector3(0,0,-1);
    }
    /**
    *Returns a Vector3 at -1, 0, 0
    * @example 
    *let pos = Vector3.Left(); // pos = new Vector3(-1,0,0)
    */
    static Left(){
        return new Vector3(-1,0,0);
    }
    /**
    *Returns a Vector3 at 1, 0, 0
    * @example 
    *let pos = Vector3.Right(); // pos = new Vector3(1,0,0)
    */
    static Right(){
        return new Vector3(1,0,0);
    }
    /**
    *Gets the distance between 2 Vector3's
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns the distance between the 2 Vectors
    *
    * @example 
    *const pos1 = new Vector3(0, 0, 0);
    *const pos2 = new Vector3(0, 1, 0);
    *   
    *let distance = Vector3.Distance(pos1, pos2); // Returns 1
    */
    static Distance(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return (Math.abs(pos1.x - pos2.x) + 1) + (Math.abs(pos1.y - pos2.y) + 1) + (Math.abs(pos1.z - pos2.z) + 1);
    }
    /**
    *Linearly interpolates a Vector3 to a Vector3 by a Number
    *@param pos1
    *The starting Vector3
    *@param pos2
    *The Vector3 to linearly interpolate to
    *@param tParam
    *The Number at which the interpolation will be returning a value from (Should be from 0 to 1)
    *@return
    *Returns a Number between the first inputs based on the tParam value (if tParam is 0.5 that is half the distance from a to b)
    *
    * @example 
    *const startPos = new Vector3(0, 0, 0);
    *const endPos = new Vector3(0, 10, 0);
    *let newPos = Vector3.Lerp(newPos, endPos, 0.5) // Returns (0, 5, 0)
    */
    static Lerp(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2, /** @type {number}*/tParam){
        let x = pos1.x + (pos2.x - pos1.x) * tParam;
        let y = pos1.y + (pos2.y - pos1.y) * tParam;
        let z = pos1.z + (pos2.z - pos1.z) * tParam;

        return new Vector3(x, y, z);
    }
    /**
    *Gets the dot product of 2 vectors
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns the dot product of the 2 Vectors
    *
    * @example 
    *const pos1 = new Vector3(2, 2, 2);
    *const pos2 = new Vector3(1, 1, 2);
    *   
    *let dot = Vector3.Dot(pos1, pos2); // Returns 8
    */
    static Dot(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return pos1.x * pos2.x + pos1.y * pos2.y + pos1.z * pos2.z;
    }
    /**
    *Gets the cross product of 2 vectors
    *@param pos1
    *The first Vector3
    *@param pos2
    *The second Vector3
    *@return
    *Returns a vector perpendicular to both input vectors
    *
    * @example 
    *const pos1 = new Vector3(2, 2, 2);
    *const pos2 = new Vector3(1, 1, 2);
    *   
    *let cross = Vector3.Cross(pos1, pos2); // Returns new Vector3(2, -2, 0)
    */
    static Cross(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        const x = pos1.y * pos2.z - pos1.z * pos2.y;
        const y = pos1.z * pos2.x - pos1.x * pos2.z;
        const z = pos1.x * pos2.y - pos1.y * pos2.x;

        return new Vector3(x,y,z);
    }
    /**
    *Gets the magnitude of a vector
    *@param pos1
    *The Vector3
    *@return
    *Returns the length of a vector
    *
    * @example 
    *const pos = new Vector3(2, 2, 2);
    *   
    *let mag = Vector3.Magnitude(pos); // Returns ~3.464
    */
    static Magnitude(/** @type {Vector3}*/pos){
        return Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
    }
    /**
    *Gets the square magnitude of a vector
    *@param pos1
    *The Vector3
    *@return
    *Returns the squared length of a vector
    *
    * @example 
    *const pos = new Vector3(2, 2, 2);
    *   
    *let sqrMag = Vector3.SqrMagnitude(pos); // Returns 12
    */
    static SqrMagnitude(/** @type {Vector3}*/pos){
        return pos.x * pos.x + pos.y * pos.y + pos.z * pos.z;
    }
    /**
    *Gets the squared distance between 2 vectors
    *@param pos1
    *The first Vector3
    *@param pos1
    *The second Vector3
    *@return
    *Returns the squared distance between 2 vectors
    *
    * @example 
    *const pos1 = new Vector3(2, 2, 2);
    *const pos2 = new Vector3(0, 0, 0);
    *   
    *let sqrDst = Vector3.SqrDistance(pos1, pos2); // Returns 12
    */
    static SqrDistance(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;

        return dx * dx + dy * dy + dz * dz;
    }
    /**
    *Normalizes the vector
    *@param dir
    *The first Vector3
    *@return
    *Returns the normalized Vector
    *
    * @example 
    *const dir = new Vector3(2, 1, 2);
    *   
    *let normalizedDir = Vector3.Normalize(dir); // Returns new Vector3(0.6666, 0.3333, 0.6666)
    */
    static Normalize(/** @type {Vector3}*/dir){
        const mag = Vector3.Magnitude(dir);
        if (mag !== 0){
            return new Vector3(dir.x / mag, dir.y / mag, dir.z / mag);
        }
        else{
            return new Vector3(0, 0, 0);
        }
    }
}
export class Vector2{
    /** @type {number}*/x = 0;
    /** @type {number}*/y = 0;
    constructor(/** @type {number}*/x,/** @type {number}*/y){
        this.x = x;
        this.y = y;
    }

    /**
    *Adds 2 Vector2's together
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@return
    *Returns a Vector2 with the inputs added together
    *
    * @example 
    *const pos1 = new Vector2(1, 1);
    *const pos2 = new Vector2(0, 1);
    *
    *let addedValue = Vector2.Add(pos1, pos2); // Returns new Vector2(1, 2)
    */
    static Add(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2){
        return new Vector2(pos1.x + pos2.x, pos1.y + pos2.y);
    }
    /**
    *Subtracts a Vector2 from another Vector2
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@return
    *Returns a Vector2 with pos1's values subtracted by pos2's values
    *
    * @example 
    *const pos1 = new Vector2(1, 1);
    *const pos2 = new Vector2(0, 1);
    *
    *let subtractedValue = Vector2.Subtract(pos1, pos2); // Returns new Vector3(1, 0)
    */
    static Subtract(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2){
        return new Vector3(pos1.x - pos2.x, pos1.y - pos2.y);
    }
    /**
    *Divides a Vector2 by another Vector2
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@return
    *Returns a Vector2 with pos1's values divided by pos2's values
    *
    * @example 
    *const pos1 = new Vector2(2, 2);
    *const pos2 = new Vector2(4, 4);
    *
    *let dividedValue = Vector2.Divide(pos1, pos2); // Returns new Vector2(0.5, 0.5)
    */
    static Divide(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
        return new Vector3(pos1.x / pos2.x, pos1.y / pos2.y, pos1.z / pos2.z);
    }
    /**
    *Multiplies a Vector2 with a number
    *@param pos1
    *The first Vector2
    *@param scale
    *The Number
    *@return
    *Returns a Vector2 with pos1's values multiplied by the scale
    *
    * @example 
    *const pos1 = new Vector2(1, 1);
    *const scale = 5
    *
    *let multipliedValue = Vector2.Scale(pos1, scale); // Returns new Vector2(5, 5)
    */
    static Scale(/** @type {Vector2}*/pos1, /** @type {number}*/scale){
        return new Vector2(pos1.x * num, pos1.y * num);
    }
    /**
    *Multiplies 2 Vector2's
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@return
    *Returns a Vector2 with the inputs multiplied
    *
    * @example 
    *const pos1 = new Vector2(1, 1, 1);
    *const pos2 = new Vector2(0, 2, 0);
    *
    *let multipliedValue = Vector2.Multiply(pos1, pos2); // Returns new Vector2(0, 2)
    */
    static Multiply(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2){
        return new Vector2(pos1.x * pos2.x, pos1.y * pos2.y);
    }
    /**
    *Checks if 2 Vector2s are the same
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@param tolerance
    *(Optional) The range at which the values can differ from one another
    *@return
    *Returns true if the Vector2's are the same otherwise it will return false
    *
    * @example 
    *const pos1 = new Vector2(0, 0);
    *const pos2 = new Vector2(0, 1);
    *
    *let check = Vector2.Equals(pos1, pos2, 0.1); // Returns false
    */
    static Equals(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2, /** @type {number}*/tolerance){
        if (tolerance == undefined){
            if (pos1.x == pos2.x && pos1.y == pos2.y){
                return true;
            }
            else{
                return false;
            }
        }
        else{
            return Math.abs(pos1.x - pos2.x) <= tolerance && Math.abs(pos1.y - pos2.y) <= tolerance;
        }
    }
    /**
    *Returns a Vector2 at 0, 0
    * @example 
    *let pos = Vector2.Zero(); // pos = new Vector2(0,0)
    */
    static Zero(){
        return new Vector2(0,0);
    }
    /**
    *Returns a Vector2 at 1, 1
    * @example 
    *let pos = Vector2.One(); // pos = new Vector2(1,1)
    */
    static One(){
        return new Vector2(1,1);
    }
    /**
    *Returns a Vector2 at 0, 1, 0
    * @example 
    *let pos = Vector2.Up(); // pos = new Vector2(0,1)
    */
    static Up(){
        return new Vector2(0,1);
    }
    /**
    *Returns a Vector2 at 0, -1
    * @example 
    *let pos = Vector2.Down(); // pos = new Vector2(0,-1)
    */
    static Down(){
        return new Vector2(0,-1);
    }
    /**
    *Returns a Vector2 at -1, 0
    * @example 
    *let pos = Vector2.Left(); // pos = new Vector2(-1,0)
    */
    static Left(){
        return new Vector2(-1,0);
    }
    /**
    *Returns a Vector2 at 1, 0
    * @example 
    *let pos = Vector2.Right(); // pos = new Vector2(1,0)
    */
    static Right(){
        return new Vector2(1,0);
    }
    /**
    *Gets the distance between 2 Vector2's
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@return
    *Returns the distance between the 2 Vectors
    *
    * @example 
    *const pos1 = new Vector2(0, 0);
    *const pos2 = new Vector2(0, 1);
    *   
    *let distance = Vector2.Distance(pos1, pos2); // Returns 1
    */
    static Distance(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2){
        return (Math.abs(pos1.x - pos2.x)) + (Math.abs(pos1.y - pos2.y));
    }
    /**
    *Linearly interpolates a Vector2 to a Vector2 by a Number
    *@param pos1
    *The starting Vector2
    *@param pos2
    *The Vector2 to linearly interpolate to
    *@param tParam
    *The Number at which the interpolation will be returning a value from (Should be from 0 to 1)
    *@return
    *Returns a Number between the first inputs based on the tParam value (if tParam is 0.5 that is half the distance from a to b)
    *
    * @example 
    *const startPos = new Vector2(0, 0);
    *const endPos = new Vector2(0, 10);
    *let newPos = Vector2.Lerp(newPos, endPos, 0.5) // Returns (0, 5)
    */
    static Lerp(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2, /** @type {number}*/tParam){
        let x = pos1.x + (pos2.x - pos1.x) * tParam;
        let y = pos1.y + (pos2.y - pos1.y) * tParam;

        return new Vector2(x, y);
    }
    /**
    *Gets the dot product of 2 vectors
    *@param pos1
    *The first Vector2
    *@param pos2
    *The second Vector2
    *@return
    *Returns the dot product of the 2 Vectors
    *
    * @example 
    *const pos1 = new Vector2(0, 0);
    *const pos2 = new Vector2(0, 1);
    *   
    *let dot = Vector2.Dot(pos1, pos2); // Returns 1
    */
    static Dot(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2){
        return pos1.x * pos2.x + pos1.y * pos2.y;
    }
/**
    *Gets the magnitude of a vector
    *@param pos1
    *The Vector2
    *@return
    *Returns the length of a vector
    *
    * @example 
    *const pos = new Vector2(2, 2);
    *   
    *let mag = Vector2.Magnitude(pos); // Returns ~2.828
    */
    static Magnitude(/** @type {Vector2}*/pos){
        return Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    }
    /**
    *Gets the square magnitude of a vector
    *@param pos1
    *The Vector2
    *@return
    *Returns the squared length of a vector
    *
    * @example 
    *const pos = new Vector2(2, 2);
    *   
    *let sqrMag = Vector2.SqrMagnitude(pos); // Returns 8
    */
    static SqrMagnitude(/** @type {Vector3}*/pos){
        return pos.x * pos.x + pos.y * pos.y + pos.z * pos.z;
    }
    /**
    *Gets the squared distance between 2 vectors
    *@param pos1
    *The first Vector2
    *@param pos1
    *The second Vector2
    *@return
    *Returns the squared distance between 2 vectors
    *
    * @example 
    *const pos1 = new Vector2(2, 2);
    *const pos2 = new Vector2(0, 0);
    *   
    *let sqrDst = Vector2.SqrDistance(pos1, pos2); // Returns 8
    */
    static SqrDistance(/** @type {Vector2}*/pos1, /** @type {Vector2}*/pos2){
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;

        return dx * dx + dy * dy;
    }
    /**
    *Normalizes the vector
    *@param dir
    *The Vector
    *@return
    *Returns the normalized Vector
    *
    * @example 
    *const dir = new Vector2(2, 1);
    *   
    *let normalizedDir = Vector2.Normalize(dir); // Returns new Vector2(0.8944, 0.4472)
    */
    static Normalize(/** @type {Vector2}*/dir){
        const mag = Vector2.Magnitude(dir);
        if (mag !== 0){
            return new Vector2(dir.x / mag, dir.y / mag);
        }
        else{
            return new Vector2(0, 0);
        }
    }
}
export class Mathf{
    /**
    *Clamps a number between a minimum and maximum number
    *@param value
    *The value to clamp
    *@param min
    *The minimum value to clamp to
    *@param max
    *The maximum value to clamp to
    * @return 
    *Returns the number provided but not exceeding the min or max values
    *
    * @example 
    *let clampedVal = Mathf.Clamp(10, -10, 5) // Returns 5
    */
    static Clamp(/** @type {number}*/value, /** @type {number}*/min, /** @type {number}*/max){
        if (value >= min && value <= max) {return value};
        if (value >= max) { return max};
        if (value <= min) {return min};
    }
    /**
    *Linearly interpolates a Number to a Number by a Number
    *@param a
    *The starting Number
    *@param b
    *The Number to linearly interpolate to
    *@param tParam
    *The Number at which the interpolation will be returning a value from (Should be from 0 to 1)
    *@return
    *Returns a Number between the first inputs based on the tParam value
    *
    * @example 
    *const speed = 0;
    *let newSpeed = Mathf.Lerp(speed, 10, 0.5) // Returns 5
    */
    static Lerp(/** @type {number}*/a, /** @type {number}*/b, /** @type {number}*/tParam){
        return a + (b - a) * tParam;
    }
    /**
    *Gets the absolute of a value
    *@param value
    *The Number to use
    * @return 
    *Returns the positive version of a number (-1 would return 1 | 1 would return 1)
    *
    * @example 
    *const negativeVal = -10;
    *let positiveVal = Mathf.Abs(negativeVal);  // Returns 10
    */
    static Abs(/** @type {number}*/value){
        if (value < 0){ return value * -1}
        else return value;
    }
}
/**
    *A class used for generating random numbers.
*/
export class Random{
    /**
    *Generates a random number from a given range.
    *@param min
    *The minimum number that could be returned.
    *@param max
    *The maximum number that could be returned.
    * @return 
    *Returns a number between the min and max inputs.
    *
    * @example 
    *let randomVal = Random.Range(0, 10);
    */
    static Range(/** @type {number}*/min, /** @type {number}*/max){
        
        return Mathf.Lerp(min, max, Math.random());
    }
}
/**
*Generates an array of Vector3s with the first Vector being the minimum Vectors and the second Vector being the maximum Vectors
*@param pos1
*The first Vector3
*@param pos2
*The second Vector3
* @return 
*Returns an array of Vector3s with the first Vector being all the smallest numbers and the second Vector being the largest numbers
*
* @example 
*let minMax = GetMinMax(new Vector3(10, 20, 20), new Vector3(20, 10, 10))  // Returns [Vector3(10, 10, 10), Vector3(20, 20, 20)]
*/
export function GetMinMax(/** @type {Vector3}*/pos1, /** @type {Vector3}*/pos2){
    let minPos = new Vector3(0, 0, 0);
    let maxPos = new Vector3(0, 0, 0);

    if (pos1.x >= pos2.x){ maxPos.x = pos1.x; minPos.x = pos2.x}
    else { minPos.x = pos1.x; maxPos.x = pos2.x }

    if (pos1.y >= pos2.y){ maxPos.y = pos1.y; minPos.y = pos2.y}
    else { minPos.y = pos1.y; maxPos.y = pos2.y }

    if (pos1.z >= pos2.z){ maxPos.z = pos1.z; minPos.z = pos2.z}
    else { minPos.z = pos1.z; maxPos.z = pos2.z }

    let Vector3s = [
        minPos,
        maxPos
    ]
    return Vector3s;
}