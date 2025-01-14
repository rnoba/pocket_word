import * as Base from "./base.js";

type Sprite = {
	start:	Base.V2;
	offset: Base.V2;
	size:		Base.V2;
}

export const EmptySprite: Sprite = {
	start:	Base.V2.Zero(),
	offset: Base.V2.Zero(),
	size:		Base.V2.Zero()
}

type Sprites = {
	tiles: Sprite[];
}

async function load_image(url: string): Promise<HTMLImageElement> {
	const image = new Image();
	image.src		= url;
	return new Promise((res, rej) => {
		image.onload = () => res(image);
		image.onerror = rej;
	});
}

function collect_sprites(size: number, image: HTMLImageElement): OffscreenCanvas[]
{
	const scalar = 0.7;
	const sprites: OffscreenCanvas[] = [];
	const count_x = Base.floor(image.width / size);
	const count_y = Base.floor(image.height	/ size);
	for (let y = 0; y < count_y; y += 1)
	{
		for (let x = 0; x < count_x; x += 1)
		{
			const offscreen_canvas	= new OffscreenCanvas(size*scalar, size*scalar);
			const offscreen_ctx			= offscreen_canvas.getContext("2d");
			if (offscreen_ctx === null) {
					throw new Error("2d context not supported");
			}
			offscreen_ctx.scale(scalar, scalar);
			offscreen_ctx.drawImage(
				image,
				x * size, y * size,
				size, size,
				0, 0, size, size
			);
			sprites.push(offscreen_canvas);
		}
	}
	return (sprites);
}

export async function load()
{
	const image		= await load_image("./sprites.png");
	const sprites = collect_sprites(Base.TW, image);
	return sprites;
}

export function draw_from_image(
	ctx: CanvasRenderingContext2D,
	src: HTMLImageElement,
	sprite: Sprite,
	camera: Base.Camera,
	x: number,
	y: number,
	z: number
) {
	const offset_x = sprite.offset.x - (Base.TW/2);
	const offset_y = sprite.offset.y - (Base.TW/2);

	const start_draw = Base.camera_transform_screen(
		camera,
		x, y, z,
		offset_x,
		offset_y
	);

	const sprite_size_x = sprite.size.x * camera.scaling;
	const sprite_size_y = sprite.size.y * camera.scaling;
	ctx.drawImage(
		src,
		Math.floor(sprite.start.x),
		Math.floor(sprite.start.y),
		Math.floor(sprite.size.x),
		Math.floor(sprite.size.y),
		Math.floor(start_draw.x),
		Math.floor(start_draw.y),
		Math.floor(sprite_size_x),
		Math.floor(sprite_size_y)
	);
}
