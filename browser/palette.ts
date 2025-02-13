import * as Ui from "./ui.js"
import * as Base from "./base.js"

export interface Palette {
	border_color: Base.RGBA;
	background_color: Base.RGBA; 
	border_size: number; 
	rouded_corners: Ui.RoundedCornersRadius;
	font: string;
	font_size: number;
	text_color: Base.RGBA;
}

export function palette(
	background_color: Base.RGBA, 
	border_color: Base.RGBA,
	border_size: number, 
	rouded_corners: Ui.RoundedCornersRadius,
	font: string,
	font_size: number,
	text_color: Base.RGBA
): Palette 
{
	return {
		border_color,
		background_color,
		border_size,
		rouded_corners,
		font,
		font_size,
		text_color
	}
}

export const default_palette = palette(Base.Hex("#7c183c"),
																			 Base.Hex("#ff8274"),
																			 5, Ui.rouded_corners(4, 4, 4, 4),
																			 "Monitorica", 20, Base.Hex("#FFFFFF"));
