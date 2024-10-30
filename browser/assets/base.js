export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 16;
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    length() {
        const l = this.x + this.y;
        return Math.sqrt(l);
    }
    length2() {
        const l = this.x + this.y;
        return l;
    }
    divide(b) {
        return new Vector2(this.x / b.x, this.y / b.y);
    }
    static zero() {
        return new Vector2(0, 0);
    }
    normalize() {
        const l = this.length();
        return new Vector2(this.x / l, this.y / l);
    }
    sub(b) {
        return new Vector2(this.x - b.x, this.y - b.y);
    }
    sub2(a, b) {
        return new Vector2(this.x - a, this.y - b);
    }
    cross(b) {
        return this.x * b.y - this.y * b.x;
    }
    add(b) {
        return new Vector2(this.x + b.x, this.y + b.y);
    }
    in_range(x0, x1, y0, y1) {
        return this.x >= x0 && this.x <= x1 && this.y >= y0 && this.y <= y1;
    }
    dist_to(b) {
        const d = b.sub(this);
        return d.length();
    }
    add2(a, b) {
        return new Vector2(this.x + a, this.y + b);
    }
    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    toFloor(offset) {
        return new Vector2(Math.floor(this.x + offset), Math.floor(this.y + offset));
    }
    toGrid() {
        const x = (this.x / TILE_WIDTH + this.y / (TILE_HEIGHT));
        const y = (this.y / (TILE_HEIGHT) - this.x / TILE_WIDTH);
        return new Vector2(x, y);
    }
    eq(b) {
        return b.x === this.x && b.y === this.y;
    }
    array() {
        return [this.x, this.y];
    }
    mul(b) {
        return new Vector2(this.x * b.x, this.y * b.y);
    }
}
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    length() {
        const l = this.x + this.y + this.z;
        return Math.sqrt(l);
    }
    eq(b) {
        return b.x === this.x && b.y === this.y && this.z === b.z;
    }
    toFloor(offset) {
        return new Vector3(Math.floor(this.x + offset), Math.floor(this.y + offset), Math.floor(this.z + offset));
    }
    divide(b) {
        return new Vector3(this.x / b.x, this.y / b.y, this.z / b.z);
    }
    mul(b) {
        return new Vector3(this.x * b.x, this.y * b.y, this.z * b.z);
    }
    yz() {
        return new Vector2(this.y, this.z);
    }
    xz() {
        return new Vector2(this.x, this.z);
    }
    xy() {
        return new Vector2(this.x, this.y);
    }
    copy() {
        return new Vector3(this.x, this.y, this.z);
    }
    normalize() {
        const l = this.length();
        return new Vector3(this.x / l, this.y / l, this.z / l);
    }
    sub(b) {
        return new Vector3(this.x - b.x, this.y - b.y, this.z - b.z);
    }
    toV2() {
        return new Vector2(this.x, this.y);
    }
    add(b) {
        return new Vector3(this.x + b.x, this.y + b.y, this.z + b.z);
    }
    add2(a, b, c) {
        return new Vector3(this.x + a, this.y + b, this.z + c);
    }
    scale(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    toScreen() {
        return new Vector2((this.x - this.y) * (TILE_WIDTH / 2), (this.x + this.y) * (TILE_HEIGHT / 2) - (this.z * (TILE_HEIGHT)));
    }
    array() {
        return [this.x, this.y, this.z];
    }
}
export { Vector2, Vector3 };
