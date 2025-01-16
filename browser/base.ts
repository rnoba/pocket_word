export const TW	= 64;
export const TH	= 32;

export let GlobalContext: CanvasRenderingContext2D | null = null;

export function set_global_ctx(ctx: CanvasRenderingContext2D)
{
	GlobalContext = ctx;
}

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
	static New(x: number, y: number) {
		return new V2(x, y);
	}
	clone() {
		return new V2(this.x, this.y);
	}
	set(b: V2): this {
		this.x = b.x;
		this.y = b.y;
		return this;
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
	add2(a: number, b: number): this {
		this.x = this.x+a;
		this.y = this.y+b;
		return this;
	}
	sub2(a: number, b: number): this {
		this.x = this.x-a;
		this.y = this.y-b;
		return this;
	}
	add(b: V2): this {
		this.x = this.x+b.x;
		this.y = this.y+b.y;
		return this;
	}
	sub(b: V2): this {
		this.x = this.x-b.x;
		this.y = this.y-b.y;
		return this;
	}
	cross(b: V2): number {
		return this.x*b.y-this.y*b.x;
	}
	dist(b: V2): number {
		b.sub2(this.x, this.y);
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

export type RGBA = {
	r: number;
	g: number;
	b: number;
	a: number;
}

export function RGBA(r: number, g: number, b: number, a: number = 1.0): RGBA
{
	const r_norm = Clamp(r, 0, 255);
	const g_norm = Clamp(g, 0, 255);
	const b_norm = Clamp(b, 0, 255);

	const color: RGBA = {
		r: r_norm, 
		g: g_norm,
		b: b_norm,
		a: Math.max(Math.min(a, 1), 0),
	}
	return (color);
}

export const RGBA_FULL_RED		= RGBA(255, 0, 0);
export const RGBA_FULL_TRANSPARENT	= RGBA(0, 0, 0, 0);
export const RGBA_FULL_GREEN	= RGBA(0, 255, 0);
export const RGBA_FULL_BLUE		= RGBA(0, 0, 255);
export const RGBA_FULL_BLACK	= RGBA(0, 0, 0);
export const RGBA_FULL_WHITE = RGBA(255, 255, 255);

const HEX = "0123456789ABCDEF";

function ntox(n: number): string
{
	let r: string = "";
	do
	{
		r = HEX[n % 16] + r;
		n >>>= 4;
	} while (n > 0);
	return (r.padStart(2, "0"));
}

export function RGBA_to_hex_string(color: RGBA): string
{
	return `#${ntox(color.r)}${ntox(color.g)}${ntox(color.b)}${ntox(color.a * 255)}`;
}

export function RGBA_to_css_string(color: RGBA): string
{
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
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
		.add2(offset_x, offset_y)
		.sub2(camera.x, camera.y)
		.scale(camera.scaling)
		.add2(
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
		.add2(camera.x, camera.y)
		.sub2(offset_x, offset_y)
		.world(z);
	return result;
}

export function mod(n: number, m: number) {
	return (n % m + m) % m;
}

export function clamp(min: number, max: number, value: number): number {
	return Math.max(min, Math.min(max, value));
}

export type Rect = {
	position: V2;
	width: number;
	height: number;
}

export function point_in_rect(point: V2, rect: Rect): Boolean {
	const rect_end_x: number = rect.position.x + rect.width;
	const rect_end_y: number = rect.position.y + rect.height;
	if ((point.x < rect.position.x	||	
			 point.y < rect.position.y) ||
			(point.x > rect_end_x				|| 
			 point.y > rect_end_y))
	{
		return (false);
	}
	return (true);
}

export function Rect(x: number, y: number, w: number, h: number): Rect
{
	return {
		position: V2.New(x, y),
		width: w,
		height: h
	}
}

export function RGB_Darken(color: RGBA, amt: number)
{
	const out = RGBA(0, 0, 0, 1);
	amt = Clamp(amt, 0, 1);

	out.r = color.r * (1.0 - amt);
	out.g = color.g * (1.0 - amt);
	out.b = color.b * (1.0 - amt);
	return (out);
}

export function RGB_Lighten(color: RGBA, amt: number)
{
	const out = RGBA(0, 0, 0, 1);
	amt = Clamp(amt, 0, 1);

	out.r = color.r * (1.0 + amt) & 0xFF;
	out.g = color.g * (1.0 + amt) & 0xFF;
	out.b = color.b * (1.0 + amt) & 0xFF;
	return (out);
}

export function assert(p: boolean, msg: string = "")
{
	if (!p)
	{
		throw new Error(`assertion failed ${msg}`);
	}
}

export function floor(n: number)
{
	return (n >> 0);
}

export function round(n: number)
{
	return (floor(n + 0.5));
}

export function Clamp(value: number, min: number, max: number): number {
	return (Math.min(Math.max(value, min), max));
}

const UINT64_MAX	= 2n**64n;

// i dont care
export function u64(value: number | bigint | string): bigint {
	return BigInt(value) % UINT64_MAX;
}

export const u640 = u64(0);

const InitialFNV	= 2166136261;
const FNVMultiple = 16777619;
export function hash_string(str: string, seed: number = 0): bigint 
{
	let hash = BigInt(InitialFNV) * BigInt(seed);
	for(let i = 0; i < str.length; i++)
	{
		hash = hash ^ BigInt(str.charCodeAt(i));
		hash = (hash * BigInt(FNVMultiple)) % UINT64_MAX;
	}
	return hash;
}

export function has_flag(value: number, flag: number): boolean {
    return (value & flag) === flag;
}

export function very_stupid_array_push_front<T>(item: T, array: Array<T>)
{
	let push = true;
	for (let i = 0; i < array.length; i++)
	{
		if (array[i] === item)
		{
			push = false;
		}
	}

	if (push)
	{
		array.unshift(item);
	}
}

export function very_stupid_array_push_back<T>(item: T, array: Array<T>)
{
	let push = true;
	for (let i = 0; i < array.length; i++)
	{
		if (array[i] === item)
		{
			push = false;
		}
	}

	if (push)
	{
		array.push(item);
	}
}

export async function load_fonts()
{
	const fonts = [
		{ family: "PixelGameExtrude", file: "./Pixel_Game_Extrude.otf" },
		{ family: "PixelGame", file: "./Pixel_Game.otf" },
		{ family: "Gameday", file: "./gameday_regular.otf" },
		{ family: "GamesStudios", file: "./games_studios_regular.otf" },
	];

	for (const {family, file} of fonts)
		{
			const font_face = new FontFace(family, `url(${file})`);
			try
			{
				const _font = await font_face.load();
				document.fonts.add(_font);
			}
			catch (err)
			{
				console.warn("could not load font: ", family, file);
			}
		}

}
export function Fixed(float: number, places: number)
{
	return (Number((round(float*(10*places))/(10*places)).toFixed(places)))
}

export type Pair<T, U = T> = [T, U];
