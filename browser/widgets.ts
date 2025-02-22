import * as Ui from "./ui.js"
import * as Base from "./base.js"
import * as Palette from "./palette.js"
import { PocketWorld } from "./main.js";
import * as Editor from "./editor.js";

export function default_container_begin(text:			string,
																				flags:		number,
																				width:		Ui.AxisSize = Ui.size_grow(),
																				height:		Ui.AxisSize = Ui.size_grow(),
																				palette:	Palette.Palette = Palette.vaporwave)
{
	Ui.push_next_palette(palette);
	Ui.push_next_size(Ui.AxisX, width); 
	Ui.push_next_size(Ui.AxisY, height); 
	Ui.push_next_child_axis(Ui.AxisY);
	const wid = Ui.widget_make(`container--${text}`,
															Ui.UiDrawBackground|Ui.UiDrawBorder|flags);
	Ui.push_parent(wid);
	Ui.push_next_text_alignment(Ui.UiTextAlignment.Center);
	Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
	Ui.push_next_size(Ui.AxisY, Ui.size_fixed(60));
	Ui.push_font_size(22);
		Ui.push_next_border_color(wid.background_color);
		Ui.push_next_rounded_corners_radii(Ui.rouded_corners(4, 4, 0, 0));
		Ui.widget_make(`container--${text}--title#${text}`, Ui.UiDrawText|Ui.UiDrawBorder); 
	Ui.pop_font_size();
}

export function default_container_end()
{
	Ui.pop_parent();
}

export function inventory()
{
	Ui.dragabble_begin("inventory--container");
		default_container_begin("inventory", 0, Ui.size_fixed(500), Ui.size_pct(0.4));
			Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
			Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
			Ui.push_next_rounded_corners_radii(Ui.rouded_corners(10, 10, 4, 4));
			Ui.push_next_background_color(Base.Hex("#d53c6a"));
			Ui.push_next_border_color(Base.Hex("#d53c6a"));
			Ui.push_next_child_axis(Ui.AxisX);

			const content = Ui.widget_make("", 0);//Ui.UiDrawBackground|Ui.UiDrawBorder);
			Ui.push_parent(content);

				Ui.push_next_size(Ui.AxisX, Ui.size_pct(0.6));
				Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
				const left = Ui.widget_make("", 0);

				Ui.spacer(Ui.size_fixed(0));
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

const sizes: Map<string, Ui.AxisSize> = new Map();
export function resizable_begin(text: string, axis: Ui.Axis)
{
	const id = `${text}-resizable`;
	let size_from_cache = sizes.get(id);
	if (!size_from_cache)
	{
		size_from_cache = Ui.size_pct(1); 
		sizes.set(id, size_from_cache);
	}
	const other = axis === Ui.AxisX ? Ui.AxisY : Ui.AxisX;
	Ui.push_next_size(axis, size_from_cache);
	Ui.push_next_size(other, Ui.size_pct(1));
	const container = Ui.widget_make(id, Ui.UiDrawBackground|Ui.UiDrawBorder);
	Ui.push_next_palette(Palette.custom(Palette.ocean, { rouded_corners: Ui.rouded_corners(0, 0, 0, 0) }));
	Ui.push_parent(container);
			Ui.push_next_size(axis, Ui.size_fixed(20));
			Ui.push_next_size(other, Ui.size_pct(1));
			Ui.push_next_palette(Palette.custom(Palette.cyberpunk, {
				border_color: Base.RGBA_FULL_TRANSPARENT,
				border_size: 0,
				rouded_corners: Ui.rouded_corners(0, 0, 0, 0),
				active_background_color: Base.RGB_Darken(Palette.cyberpunk.background_color, 0.1), 
				hot_background_color: Base.RGB_Darken(Palette.cyberpunk.background_color, 0.5), 
			}, true));

			const interaction_area = Ui.widget_make(`${id}--interaction`, Ui.UiClickable|Ui.UiDrawBackground|Ui.UiDrawBorder);
			const interaction = Ui.widget_with_interaction(interaction_area);
			if (interaction.dragging)
			{
				const delta = Ui.ui_drag_delta();
				const delta_axis	= axis === Ui.AxisX ? delta.x : delta.y;
				const total				= container.parent!.fixed_size[axis];
				const step				= Math.abs(delta_axis) / total * Ui.ui_state.delta_time * 100;
				size_from_cache.value = Base.Clamp(size_from_cache.value - (Math.sign(delta_axis) * step), 0.1, 1); 
				Ui.ui_reset_drag_delta();
			}
}

export function resizable_end()
{
	Ui.pop_parent();
}

export function editor_draw(parent: Ui.UiWidget)
{
	Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
	Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
	let axis: Ui.Axis = Ui.AxisX;
	if (parent.fixed_size[Ui.AxisX] < 1000) { axis = Ui.AxisY; }
	Ui.push_next_child_axis(axis);
	const editor_root = Ui.widget_make("editor", 0);

	Ui.push_parent(editor_root);
		Ui.push_next_palette(Palette.custom(Palette.neon, { rouded_corners: Ui.rouded_corners(0, 0, 0, 0) })); 
		Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
		Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
		const editor_area = Ui.widget_make("editor--area", Ui.UiDrawBackground|Ui.UiDrawBorder);  
		Ui.push_parent(editor_area);
			Editor.editor(editor_area);
		Ui.pop_parent();
		resizable_begin("editor--right--container", editor_root.layout_axis);
			Editor.editor_options();
		resizable_end();
	Ui.pop_parent();
}

export function editor(dt: number, state: PocketWorld, root?: Ui.UiWidget)
{
	if (root)
	{
		Ui.push_parent(root);
			editor_draw(root);
		Ui.pop_parent();
	}
	else
	{
		Ui.ui_frame_begin(dt, Ui.size_fixed(state.camera.width), Ui.size_fixed(state.camera.height));
			editor_draw(Ui.ui_state.root!);
		Ui.ui_frame_end();
	}
}
