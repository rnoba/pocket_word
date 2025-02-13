export function palette(background_color, border_color, border_size, rouded_corners, font, font_size, text_color) {
    return {
        border_color,
        background_color,
        border_size,
        rouded_corners,
        font,
        font_size,
        text_color
    };
}
export const default_palette = palette(Base.Hex("#31051e"), Base.Hex("#7c183c"), 7, rouded_corners(1, 1, 1, 1), "PixelGame", 16, Base.Hex("#b1bbb5"));
