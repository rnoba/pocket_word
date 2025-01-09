import { Camera, camera_transform_screen, TW, V2 } from "./base.js";

type Sprite = {
	start:	V2;
	offset: V2;
	size:		V2;
}

export const EmptySprite: Sprite = {
	start:	V2.Zero(),
	offset: V2.Zero(),
	size:		V2.Zero()
}

type Sprites = {
	tiles: Sprite[];
}

export function draw_from_image(
	ctx: CanvasRenderingContext2D,
	src: HTMLImageElement,
	sprite: Sprite,
	camera: Camera,
	x: number,
	y: number,
	z: number
) {
	const offset_x = sprite.offset.x - (TW/2);
	const offset_y = sprite.offset.y - (TW/2);

	const start_draw = camera_transform_screen(
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
