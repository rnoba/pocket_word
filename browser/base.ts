export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 32;

class Vector2 {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	length(): number {
		const l = this.x*this.y;
		return Math.sqrt(l);
	}
	length2(): number {
		const l = this.x*this.y;
		return l;
	}
	divide(b: Vector2): Vector2 {
		return new Vector2(this.x/b.x, this.y/b.y);
	}
	normalize(): Vector2 {
		const l = this.length();
		return new Vector2(this.x/l, this.y/l);
	}
	sub(b: Vector2): Vector2 {
		return new Vector2(this.x-b.x, this.y-b.y);
	}
	sub2(a: number, b: number): Vector2 {
		return new Vector2(this.x-a, this.y-b);
	}
	cross(b: Vector2): number {
		return this.x*b.y-this.y*b.x;
	}
	dot(b: Vector2): number {
		return this.x*b.x+this.y*b.y;
	}
	add(b: Vector2): Vector2 {
		return new Vector2(this.x+b.x, this.y+b.y);
	}
	in_range(x0: number, x1: number, y0: number, y1: number): Boolean {
		return this.x >= x0 && this.x <= x1 && this.y >= y0 && this.y <= y1;
	}
	dist_to(b: Vector2): number {
		const d = b.sub(this);
		return d.length();
	}
	add2(a: number, b: number): Vector2 {
		return new Vector2(this.x+a, this.y+b);
	}
	scale(scalar: number): Vector2 {
		return new Vector2(this.x*scalar, this.y*scalar);
	}
	toFloor(offset: number): Vector2 {
		return new Vector2(Math.floor(this.x+offset), Math.floor(this.y+offset));
	}
	toGrid(): Vector2 {
		const x = (this.x / TILE_WIDTH + this.y / (TILE_HEIGHT / 2));
		const y = (this.y / (TILE_HEIGHT / 2) - this.x / TILE_WIDTH)
		return new Vector2(x, y);
	}
	eq(b: Vector2) {
		return b.x === this.x && b.y === this.y;
	}
	array(): [number, number] {
		return [this.x, this.y];
	}
	mul(b: Vector2): Vector2 {
		return new Vector2(this.x*b.x, this.y*b.y);
	}
}

class Vector3 {
	x: number;
	y: number;
	z: number;
	constructor(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	length(): number {
		const l = this.x*this.y*this.z;
		return Math.sqrt(l);
	}
	eq(b: Vector3) {
		return b.x === this.x && b.y === this.y && this.z === b.z;
	}
	divide(b: Vector3): Vector3 {
		return new Vector3(this.x/b.x, this.y/b.y, this.z/b.z);
	}
	mul(b: Vector3): Vector3 {
		return new Vector3(this.x*b.x, this.y*b.y, this.z*b.z);
	}
	yz(): Vector2 {
		return new Vector2(this.y, this.z);
	}
	xz(): Vector2 {
		return new Vector2(this.x, this.z);
	}
	xy(): Vector2 {
		return new Vector2(this.x, this.y);
	}
	copy(): Vector3 {
		return new Vector3(this.x, this.y, this.z);
	}
	normalize(): Vector3 {
		const l = this.length();
		return new Vector3(this.x/l, this.y/l, this.z/l);
	}
	sub(b: Vector3): Vector3 {
		return new Vector3(this.x-b.x, this.y-b.y, this.z-b.z);
	}
	toV2(): Vector2 {
		return new Vector2(this.x, this.y);
	}
	add(b: Vector3): Vector3 {
		return new Vector3(this.x+b.x, this.y+b.y, this.z+b.z);
	}
	add2(a: number, b: number, c: number): Vector3 {
		return new Vector3(this.x+a, this.y+b, this.z+c);
	}
	scale(scalar: number): Vector3 {
		return new Vector3(this.x*scalar, this.y*scalar, this.z*scalar);
	}
	toScreen(): Vector2 {
		return new Vector2((this.x-this.y)*(TILE_WIDTH/2), (this.x+this.y)*(TILE_HEIGHT/4)-(this.z*(TILE_HEIGHT/2)));
	}
	array(): [number, number, number] {
		return [this.x, this.y, this.z];
	}
}

export {
	Vector2,
	Vector3
}
