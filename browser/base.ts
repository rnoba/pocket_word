export const TW	= 64;
export const TH	= 32;

export class V2 {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	static Zero() {
		return new V2(0, 0);
	}
	set(b: V2): this {
		this.x = b.x;
		this.y = b.y;
		return this;
	}
	copy(): V2 {
		return new V2(this.x, this.y);
	}
	len(): number {
		const l = this.x*this.x+this.y*this.y;
		return Math.sqrt(l);
	}
	len2(): number {
		return this.x*this.x+this.y*this.y;
	}
	div(b: V2): this {
		if (b.x !== 0 && b.y !== 0) { 
			this.x = this.x/b.x;
			this.y = this.y/b.y;
		}
		return this;
	}
	norm(): this {
		const l = this.len();
		if (l !== 0) {
			this.x = this.x/l;
			this.y = this.y/l;
		}
		return this;
	}
	translate(b: V2):  this {
		this.x = this.x+b.x;
		this.y = this.y+b.y;
		return this;
	}
	add(a: number, b: number): this {
		this.x = this.x+a;
		this.y = this.y+b;
		return this;
	}
	sub(a: number, b: number): this {
		this.x = this.x-a;
		this.y = this.y-b;
		return this;
	}
	cross(b: V2): number {
		return this.x*b.y-this.y*b.x;
	}
	dist(b: V2): number {
		b.sub(this.x, this.y);
		return b.len();
	}
	scale(scalar: number): this {
		this.x = this.x*scalar;
		this.y = this.y*scalar;
		return this;
	}
	floor(): this {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}
	world(z: number = 0): this {
		const prev_x = this.x;
		this.x = this.x / TW + this.y / TH;
		this.y = this.y / TH - prev_x / TW + z * TH;
		return this;
	}
	screen(z: number = 0): this {
		const prev_x = this.x;
		this.x = (this.x - this.y) * (TW / 2);
		this.y = (prev_x + this.y) * (TH / 2) - z * TH;
		return this;
	}
	array(): [number, number] {
		return [this.x, this.y];
	}
}

export interface Camera {
	width: number;
	height: number;
	x: number;
	y: number;
	z: number;
	word_position: V2;
	scaling: number;
	is_locked: boolean;
}

export function camera_transform_screen(
	camera: Camera,
	x: number,
	y: number,
	z: number,
	offset_x: number = 0,
	offset_y: number = 0
): V2 {
	const result: V2 =  V2.Zero();
	result.x = x;
	result.y = y;
	result.screen(z)
		.add(offset_x, offset_y)
		.sub(camera.x, camera.y)
		.scale(camera.scaling)
		.add(
			camera.width	* 0.5,
			camera.height * 0.5
		);
	return result;
}

export function camera_transform_world(
	camera: Camera,
	x: number,
	y: number,
	z: number,
	offset_x: number = 0,
	offset_y: number = 0
): V2 {
	const result: V2 =  V2.Zero();
	result.x = x - camera.width	  * 0.5;
	result.y = y - camera.height	* 0.5;
	result.scale(1/camera.scaling)
		.add(camera.x, camera.y)
		.sub(offset_x, offset_y)
		.world(z);
	return result;
}

export function mod(n: number, m: number) {
	return (n % m + m) % m;
}

export function clamp(min: number, max: number, value: number): number {
	return Math.max(min, Math.min(max, value));
}
