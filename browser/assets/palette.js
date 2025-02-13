import * as Ui from "./ui.js";
import * as Base from "./base.js";
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
export const default_palette = palette(Base.Hex("#7c183c"), Base.Hex("#ff8274"), 5, Ui.rouded_corners(4, 4, 4, 4), "Monitorica", 20, Base.Hex("#FFFFFF"));
