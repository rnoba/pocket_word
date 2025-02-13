import * as Ui from "./ui.js";
import * as Base from "./base.js";
import * as Palette from "./palette.js";
export function default_container_begin(text, flags, width = Ui.size_grow(), height = Ui.size_grow(), palette = Palette.default_palette) {
    Ui.push_next_palette(palette);
    Ui.push_next_size(Ui.AxisX, width);
    Ui.push_next_size(Ui.AxisY, height);
    Ui.push_next_child_axis(Ui.AxisY);
    const wid = Ui.widget_make(`container--${text}`, Ui.UiDrawBackground | Ui.UiDrawBorder | flags);
    Ui.push_parent(wid);
    Ui.push_next_text_alignment(Ui.UiTextAlignment.Center);
    Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
    Ui.push_next_size(Ui.AxisY, Ui.size_fixed(60));
    Ui.push_font_size(22);
    Ui.push_next_border_color(wid.background_color);
    Ui.push_next_rounded_corners_radii(Ui.rouded_corners(4, 4, 0, 0));
    Ui.widget_make(`container--${text}--title#${text}`, Ui.UiDrawText | Ui.UiDrawBorder);
    Ui.pop_font_size();
}
export function default_container_end() {
    Ui.pop_parent();
}
export function inventory() {
    Ui.dragabble_begin("inventory--container");
    default_container_begin("inventory", 0, Ui.size_pct(0.4), Ui.size_pct(0.4));
    Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
    Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
    Ui.push_next_rounded_corners_radii(Ui.rouded_corners(10, 10, 4, 4));
    Ui.push_next_background_color(Base.Hex("#d53c6a"));
    Ui.push_next_border_color(Base.Hex("#d53c6a"));
    Ui.push_next_child_axis(Ui.AxisX);
    const content = Ui.widget_make("", 0); //Ui.UiDrawBackground|Ui.UiDrawBorder);
    Ui.push_parent(content);
    Ui.push_next_size(Ui.AxisX, Ui.size_pct(0.6));
    Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
    const left = Ui.widget_make("", 0);
    Ui.spacer(Ui.size_fixed(5));
    Ui.push_parent(left);
    Ui.scrollable_grid(Ui.size_pct(1), Ui.size_pct(0.8), 64, 64);
    Ui.spacer(Ui.size_fixed(10));
    Ui.push_next_size(Ui.AxisX, Ui.size_fixed(20));
    Ui.push_next_size(Ui.AxisY, Ui.size_pct(0.8));
    Ui.scroll(left);
    Ui.pop_parent();
    Ui.push_next_size(Ui.AxisX, Ui.size_pct(0.5));
    Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
    Ui.push_next_background_color(Base.Hex("#FF0000"));
    const right = Ui.widget_make("inventory--content--right", 0);
    Ui.pop_parent();
    default_container_end();
    Ui.dragabble_end();
}
