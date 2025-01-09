import { camera_transform_screen, TW, V2 } from "./base.js";
export const EmptySprite = {
    start: V2.Zero(),
    size: V2.Zero(),
    offset: V2.Zero()
};
const SPRITES = {
    tiles: [
        {
            start: new V2(0, 0),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(64, 0),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(0, 64),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(64, 64),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(64, 128),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(128, 128),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(128, 64),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(64, 208),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(0, 128),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(0, 192),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
        {
            start: new V2(128, 0),
            size: new V2(64, 64),
            offset: new V2(0, 0)
        },
    ],
};
export function draw_from_image(ctx, src, sprite, camera, x, y, z) {
    const offset_x = sprite.offset.x - (TW / 2);
    const offset_y = sprite.offset.y - (TW / 2);
    const start_draw = camera_transform_screen(camera, x, y, z, offset_x, offset_y);
    const sprite_size_x = sprite.size.x * camera.scaling;
    const sprite_size_y = sprite.size.y * camera.scaling;
    ctx.drawImage(src, Math.floor(sprite.start.x), Math.floor(sprite.start.y), Math.floor(sprite.size.x), Math.floor(sprite.size.y), Math.floor(start_draw.x), Math.floor(start_draw.y), Math.floor(sprite_size_x), Math.floor(sprite_size_y));
}
