import * as Base from "./base.js";

export type SpriteId = bigint;

export type Sprite = {
	id: number;
	rect: Base.Rect;

	offset_x: number; 
	offset_y: number; 

	description: string;
	name: string;
	created_at: string;
	source_file: string;
}

export type SpriteB = {
	id: number;
	rect: Base.Rect;
	offset_x: number; 
	offset_y: number; 
	description: string;
	name: string;
	created_at: string;
	source_file: string;
}

export function Sprite_new(
	rect: Base.Rect,
	source_file: string,
	id: number = 0,
	offset_x: number = 0, 
	offset_y: number = 0,
	description: string = "<DESCRIPTION>",
	name: string = "<NAME>",
	created_at: string = "",
)
{
	const sprite: Sprite = {
		id,
		rect,
		offset_x,
		offset_y,
		description,
		name,
		source_file,
		created_at
	}
	return (sprite);
}

async function load_image(url: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.src		= url;
	return new Promise((res, rej) => {
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

async function create_scaled_bitmap(original: ImageBitmap, scaled_width: number, scaled_height: number) {
    const offscreen_canvas = new OffscreenCanvas(scaled_width, scaled_height);
    const offscreen_ctx = offscreen_canvas.getContext('2d');
		Base.assert(offscreen_ctx !== null, "2D context not supported");
    offscreen_ctx!.drawImage(original, 0, 0, scaled_width, scaled_height);
    return (createImageBitmap(offscreen_canvas));
}

async function create_transparent_bitmap(original: ImageBitmap, opacity: number) {
    const offscreen_canvas = new OffscreenCanvas(original.width, original.height);
    const offscreen_ctx = offscreen_canvas.getContext('2d');
		Base.assert(offscreen_ctx !== null, "2D context not supported");
    offscreen_ctx!.globalAlpha = opacity;
    offscreen_ctx!.drawImage(original, 0, 0);
    return (createImageBitmap(offscreen_canvas));
}


async function collect_sprites(size: number, image: HTMLImageElement): Promise<Array<ImageBitmap>>
{
	const count_x = Base.Floor(image.width / size);
	const count_y = Base.Floor(image.height	/ size);

	const promises: Array<Promise<ImageBitmap>> = [];
	for (let y = 0; y < count_y; y += 1)
	{
		for (let x = 0; x < count_x; x += 1)
		{
			const original	= createImageBitmap(image, x * size, y * size, size, size);
			//const promise		= create_scaled_bitmap(original, size * 0.7, size * 0.7);
			promises.push(original);
		}
	}
	return (await Promise.all(promises));
}

export const sprite_sources: SpriteSource[] = [];

export async function load_sources()
{
	const files = ["./test6.png"];

	for (const file of files)
	{
		const bitmap = await load_image(file);
		sprite_sources.push({
			id: file,
			bitmap
		});

	}
}

export type SpriteSource = { id: string, bitmap: HTMLImageElement | ImageBitmap };

export function draw_from_image(
	ctx:		CanvasRenderingContext2D,
	src:		SpriteSource,
	sprite: Sprite,
	camera: Base.Camera,
	x: number,
	y: number,
	z: number
) {
	const offset_x = sprite.offset_x - (Base.TW/2);
	const offset_y = sprite.offset_y - (Base.TH/2);

	const dest = Base.V2.Zero();
	Base.camera_transform_screen(camera, x, y, z, dest, offset_x, offset_y);
	const sprite_size_x = sprite.rect.width * camera.zoom;
	const sprite_size_y = sprite.rect.height * camera.zoom;
	//console.log(sprite.rect.position.x, sprite.rect.position.y, Base.Floor(sprite_size_x), Base.Floor(sprite_size_y));
	ctx.drawImage(
		src.bitmap,
		Base.Floor(sprite.rect.position.x),
		Base.Floor(sprite.rect.position.y),
		Base.Floor(sprite.rect.width),
		Base.Floor(sprite.rect.height),
		Base.Floor(dest.x),
		Base.Floor(dest.y),
		Base.Floor(sprite_size_x),
		Base.Floor(sprite_size_y)
	);
}

export function draw_from_image_(
	ctx:		CanvasRenderingContext2D,
	src:		SpriteSource,
	sprite: Sprite,
	sx: number,
	sy: number,
	scaling = 1)
{
	//ctx.save();
	//ctx.scale(scaling, scaling);
	const width		= Base.align_pow2(sprite.rect.width		* scaling, 2);
	const height	= Base.align_pow2(sprite.rect.height	* scaling, 2);
	//const width		= sprite.rect.width;
	//const height	= sprite.rect.height;
	ctx.drawImage(src.bitmap,
								sprite.rect.position.x,
								sprite.rect.position.y,
								sprite.rect.width,
								sprite.rect.height,
								Base.Floor(sx), Base.Floor(sy),
								width,	height);
	//ctx.restore();
}
