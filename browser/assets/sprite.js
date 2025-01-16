import * as Base from "./base.js";
export function Sprite_new(rect, offset_x, offset_y, description = "<EMPTY>", name = "<EMPTY>") {
    const id = Base.hash_string(name + description + Math.random());
    const sprite = {
        id,
        rect,
        offset_x,
        offset_y,
        description,
        name
    };
    return (sprite);
}
async function load_image(url) {
    const image = new Image();
    image.src = url;
    return new Promise((res, rej) => {
        image.onload = () => res(image);
        image.onerror = rej;
    });
}
async function create_scaled_bitmap(original, scaled_width, scaled_height) {
    const offscreen_canvas = new OffscreenCanvas(scaled_width, scaled_height);
    const offscreen_ctx = offscreen_canvas.getContext('2d');
    Base.assert(offscreen_ctx !== null, "2D context not supported");
    offscreen_ctx.drawImage(original, 0, 0, scaled_width, scaled_height);
    return (createImageBitmap(offscreen_canvas));
}
async function create_transparent_bitmap(original, opacity) {
    const offscreen_canvas = new OffscreenCanvas(original.width, original.height);
    const offscreen_ctx = offscreen_canvas.getContext('2d');
    Base.assert(offscreen_ctx !== null, "2D context not supported");
    offscreen_ctx.globalAlpha = opacity;
    offscreen_ctx.drawImage(original, 0, 0);
    return (createImageBitmap(offscreen_canvas));
}
async function collect_sprites(size, image) {
    const count_x = Base.floor(image.width / size);
    const count_y = Base.floor(image.height / size);
    const promises = [];
    for (let y = 0; y < count_y; y += 1) {
        for (let x = 0; x < count_x; x += 1) {
            const original = createImageBitmap(image, x * size, y * size, size, size);
            //const promise		= create_scaled_bitmap(original, size * 0.7, size * 0.7);
            promises.push(original);
        }
    }
    return (await Promise.all(promises));
}
export async function load() {
    const image_test = await load_image("./test.png");
    const image_test_2 = await load_image("./test_2.png");
    const image = await load_image("./sprites.png");
    const sprites = await collect_sprites(Base.TW, image);
    const scale_x = 800 / image.width;
    const scale_y = 600 / image.height;
    const source_bitmap_original_test = await createImageBitmap(image_test, 0, 0, image_test.width, image_test.height);
    const source_bitmap_original_test_2 = await createImageBitmap(image_test_2, 0, 0, image_test_2.width, image_test_2.height);
    const source_bitmap_original = await createImageBitmap(image, 0, 0, image.width, image.height);
    return [sprites, source_bitmap_original_test];
}
export function draw_from_image(ctx, src, sprite, camera, x, y, z) {
    const offset_x = sprite.offset_x - (Base.TW / 2);
    const offset_y = sprite.offset_y - (Base.TW / 2);
    const start_draw = Base.camera_transform_screen(camera, x, y, z, offset_x, offset_y);
    const sprite_size_x = sprite.rect.width * camera.scaling;
    const sprite_size_y = sprite.rect.height * camera.scaling;
    ctx.drawImage(src, Math.floor(sprite.rect.position.x), Math.floor(sprite.rect.position.y), Math.floor(sprite.rect.width), Math.floor(sprite.rect.height), Math.floor(start_draw.x), Math.floor(start_draw.y), Math.floor(sprite_size_x), Math.floor(sprite_size_y));
}
