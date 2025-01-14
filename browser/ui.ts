import * as Base	from "./base.js";
import * as Input from "./input.js";

const Ui_DefaultWidgetPaddingPxH = 1;
const Ui_DefaultWidgetPaddingPxV = 1;
const Ui_DefaultWidgetPaddingPxH2 = Ui_DefaultWidgetPaddingPxH*2;
const Ui_DefaultWidgetPaddingPxV2 = Ui_DefaultWidgetPaddingPxV*2;
const Ui_DefaultRoundedCornersRadii = 10;
const Ui_DefaultBorderSize	= 2;
const Ui_DefaultTextSize		= 16;
const Ui_DefaultFont				= "Arial";
const Ui_DefaultBackgroundcolor = Base.RGBA(195, 75, 114);
const Ui_DefaultActiveBackgroundcolor = Base.RGB_Darken(Ui_DefaultBackgroundcolor, 0);
const Ui_DefaultHotBackgroundcolor = Base.RGB_Lighten(Ui_DefaultBackgroundcolor, 0);
const Ui_InventorySlotSize	= 64;
const Ui_InventoryColumns		= 4;
const Ui_DefaultBorderColor = Base.RGBA(0, 0, 0);
const Ui_DefaultTextColor		= Base.RGBA(255, 255, 255);
const Ui_InventorySpacing		= 1;

function Ui_DrawRoundedRectagle(
	rect: Base.Rect, 
	radii: [number, number, number, number], 
	px: number,
	fill: boolean = false,
	stroke: boolean = true) {
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawRoundedRectagle()` GlobalContext must be initialized");
	const ctx = Base.GlobalContext!; 

	Base.GlobalContext!.lineWidth = px;
	const [r00, r01, r10, r11] = radii;

	const [x, y] = rect.position.array();
	const { width, height } = rect;
  ctx.beginPath();

  ctx.moveTo(x + r00 + px, y + px);
  ctx.lineTo(x + width - r01 - px, y + px);
  ctx.quadraticCurveTo(x + width - px, y + px, x + width - px, y + r01);

  ctx.lineTo(x + width - px, y + height - r11);
  ctx.quadraticCurveTo(x + width - px, y + height - px, x + width - r11 - px, y + height - px);

  ctx.lineTo(x + r10 + px, y + height - px);
  ctx.quadraticCurveTo(x + px, y + height - px, x + px, y + height - r10);

  ctx.lineTo(x + px, y + r00);
  ctx.quadraticCurveTo(x + px, y + px, x + r00 + px, y + px);
  ctx.closePath();

  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}


function Ui_IsDragabble(widget: Ui_Widget)
{
	return (Base.has_flag(widget.flags, UiDragabbleX) ||
					Base.has_flag(widget.flags, UiDragabbleY));
}
export function Ui_DrawText(
	text: string,
	color: Base.RGBA,
	x: number,
	y: number,
	font_size_px: number = Ui_DefaultTextSize,
	font: string = Ui_DefaultFont)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawText()` GlobalContext must be initialized");
	Base.GlobalContext!.fillStyle	= Base.RGBA_to_hex_string(color); 
	Base.GlobalContext!.font			= `${font_size_px}px ${font}`;
	Base.GlobalContext!.fillText(text, x, y);
}

function Ui_WidgetDrawRect(widget: Ui_Widget)
{
	let color = widget.background_color;
	if (Ui_WidgetIsHot(widget!.id))
	{
		color = widget.hot_color;
	}
	if (Ui_WidgetIsActive(widget.id))
	{
		color = widget.active_color;
	}
	Base.GlobalContext!.fillStyle		= Base.RGBA_to_css_string(color);
	Base.GlobalContext!.strokeStyle = Base.RGBA_to_css_string(widget.border_color);
	const radii = widget.radii;
	Ui_DrawRoundedRectagle(widget.rect,
												 radii,
												 widget.border_size_px,
												Base.has_flag(widget.flags, UiDrawBackground),
												Base.has_flag(widget.flags, UiDrawBorder));
}

type WidgetId = bigint; 

interface Ui_State
{
	input: null | Input.InputInstance;
	active: WidgetId;
	hot: WidgetId;
	is_dragging: boolean; 
	drag_start: Base.V2;
	current_frame: number;
	dt: number;
	cleanup: Map<WidgetId, {widget: Ui_Widget, frame: number}>; 
	draggables: Map<WidgetId, Ui_Draggable>;
	sizes: Map<WidgetId, {width: number, height: number}>;
	stack: Ui_Widget[];
	bg_color_stack: Base.RGBA[];
	text_color_stack: Base.RGBA[];
	active_color_stack: Base.RGBA[];
	hot_color_stack: Base.RGBA[];
	padding_stack: Array<[number, number, number, number]>;
	rounded_corner_radii_stack: Array<[number, number, number, number]>;
	border_px_stack: number[]; 
	border_color_stack: Base.RGBA[];
	font_stack: Array<[string, number]>;
	text_offset_stack: Array<Base.V2>;
}

export const UiTextCenteredX		= 1 << 0;
export const UiTextCenteredY		= 1 << 1;
export const UiTextCentered			= UiTextCenteredX|UiTextCenteredY;
export const UiDrawText					= 1 << 2;
export const UiDrawBackground		= 1 << 3;
export const UiDrawBorder				= 1 << 4;
export const UiClickable				= 1 << 5;
export const UiDrawImage				= 1 << 6;
export const UiImageCenteredX		= 1 << 7;
export const UiImageCenteredY		= 1 << 8;
export const UiDragabbleX				= 1 << 9;
export const UiDragabbleY				= 1 << 10;
export const UiDragabble				= UiDragabbleX|UiDragabbleY; 
export const UiImageCentered		= UiImageCenteredX|UiImageCenteredY;

interface Ui_Draggable
{
	position: Base.V2
	previous_position: Base.V2
	frame: number;
}

const UiState: Ui_State = {
	input: null,
	dt: 0,
	active: Base.u640,
	hot: Base.u640,
	sizes: new Map(),
	cleanup: new Map(),
	current_frame: 0,
	is_dragging: false, 
	drag_start: Base.V2.Zero(),
	draggables: new Map(),
	stack: [],
	padding_stack: [],
	active_color_stack: [],
	hot_color_stack: [],
	bg_color_stack: [],
	rounded_corner_radii_stack: [],
	border_px_stack: [],
	border_color_stack: [],
	text_color_stack: [],
	text_offset_stack: [],
	font_stack: []
}

export function SetInputInstance(input: Input.InputInstance)
{
	UiState.input = input;
}

function Ui_Push(wid: Ui_Widget)
{
	Base.very_stupid_array_push_back(wid, UiState.stack);
}

function Ui_PopFront()
{
	const widget = UiState.stack.shift();
	if (widget)
	{
		UiState.cleanup.set(widget.id, { frame: UiState.current_frame, widget });
	}
	return (widget);
}

function Ui_SetPosition(widget: Ui_Widget, delta: Base.V2)
{
	if (!Ui_IsDragabble(widget))
	{
		console.warn("position of non draggables elements are not persistant");
		return;
	}

	const draggable = UiState.draggables.get(widget.id)!;
	if (draggable)
	{
		Ui_RectClearPos(widget, draggable.previous_position);
		draggable.previous_position.set(widget.rect.position);
		draggable.position.set(delta);
	}
	else
	{
		UiState.draggables.set(widget.id, {
			previous_position: widget.rect.position,
			position: delta,
			frame: UiState.current_frame
		})!;
	}
}

export function Ui_SetSize(widget: Ui_Widget, width: number, height: number)
{
	UiState.sizes.set(widget.id, {
		width,
		height
	})!;
}

export function Rect(a: number[], b: number[])
{
	const [x, y] = a;
	const [width, height] = b;
	return (Base.Rect(x, y, width + Ui_DefaultWidgetPaddingPxH, height + Ui_DefaultWidgetPaddingPxV));
}

export const WidgetPTop			= 0;
export const WidgetPLeft		= 1;
export const WidgetPBottom	= 2;
export const WidgetPRight		= 3;

export const WidgetBorderRadiusTL		= 0;
export const WidgetBorderRadiusTR		= 1;
export const WidgetBorderRadiusBL		= 2;
export const WidgetBorderRadiusBR		= 3;

interface Ui_Widget
{
	id:		WidgetId;
	str:	string;
	rect: Base.Rect;
	actual_width: number;
	actual_height: number;
	text_rect: Base.Rect | null;
	flags: number;
	border_size_px: number;
	text_size_px: number;
	padding: [number, number, number, number];
	radii: [number, number, number, number];
	font: string;
	background_color: Base.RGBA;
	active_color: Base.RGBA;
	hot_color: Base.RGBA;
	border_color: Base.RGBA;
	text_color: Base.RGBA;
	image_data: OffscreenCanvas | null;
	text_offset: Base.V2; 
}

function Ui_Widget_new(
	text: string,
	rect: Base.Rect, 
	flags: number
)
{
	const id: WidgetId	= Base.hash_string(text);
	const from_stack		= Ui_FindWidget(id);
	if (from_stack)
	{
		return (from_stack);
	}

	let text_rect: Base.Rect | null = null;
	if (Base.has_flag(flags, UiDrawText))
	{
		text_rect = Ui_RectFromText(text);
	}
	const widget: Ui_Widget = {
		id,
		image_data: null,
		rect,
		text_offset: Base.V2.Zero(),
		padding: [
			Ui_DefaultWidgetPaddingPxV,
			Ui_DefaultWidgetPaddingPxH,
			Ui_DefaultWidgetPaddingPxV,
			Ui_DefaultWidgetPaddingPxH
		],
		radii: [
			Ui_DefaultRoundedCornersRadii,
			Ui_DefaultRoundedCornersRadii,
			Ui_DefaultRoundedCornersRadii,
			Ui_DefaultRoundedCornersRadii
		],
		str: text,
		flags: flags,
		background_color: Ui_DefaultBackgroundcolor,
		active_color: Ui_DefaultActiveBackgroundcolor,
		hot_color: Ui_DefaultHotBackgroundcolor,
		border_color: Ui_DefaultBorderColor,
		text_color: Ui_DefaultTextColor,
		text_rect,
		font: Ui_DefaultFont,
		text_size_px: Ui_DefaultTextSize,
		actual_width: rect.width-(Ui_DefaultBorderSize*2)-Ui_DefaultWidgetPaddingPxH2,
		actual_height: rect.height-(Ui_DefaultBorderSize*2)-Ui_DefaultWidgetPaddingPxV2,
		border_size_px: Ui_DefaultBorderSize
	}

	if (Ui_IsDragabble(widget))
	{
		const draggable = UiState.draggables.get(id);
		if (draggable)
		{
			widget.rect.position.set(draggable.position);
			draggable.frame = UiState.current_frame;
		}
	}
	const size = UiState.sizes.get(id);
	if (size)
	{
		widget.rect.width		= size.width;
		widget.rect.height	= size.height;
	}
	Ui_Push(widget);
	return (widget);
}

function Ui_RectFromText(text: string, font_size_px: number = Ui_DefaultTextSize, font: string = Ui_DefaultFont)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_RectFromText()` GlobalContext must be initialized");
	Base.GlobalContext!.font = `${font_size_px}px ${font}`;
	const metrics = Base.GlobalContext!.measureText(text);
	const w = metrics.actualBoundingBoxRight	+
						metrics.actualBoundingBoxLeft;
	const h = metrics.actualBoundingBoxAscent		+
						metrics.actualBoundingBoxDescent;
	return Base.Rect(
		metrics.actualBoundingBoxLeft,
		metrics.actualBoundingBoxAscent,
		Base.round(w), Base.round(h));
}

function Ui_FindWidget(id: WidgetId)
{
	let widget: Ui_Widget | null = null;
	for (let i = 0; i < UiState.stack.length; i++)
	{
		if (UiState.stack[i].id == id)
		{
			widget = UiState.stack[i]; 
		}
	}
	return (widget);
}

function Ui_RectClear(widget: Ui_Widget)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_RectClear()` GlobalContext must be initialized");
	const x = widget.rect.position.x - widget.border_size_px;
	const y = widget.rect.position.y - widget.border_size_px;
	Base.GlobalContext!.clearRect(
		x, y,
		widget.rect.width		+ (widget.border_size_px*2),
		widget.rect.height	+ (widget.border_size_px*2));
}

function Ui_RectClearPos(widget: Ui_Widget, position: Base.V2)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_RectClear()` GlobalContext must be initialized");
	const x = position.x - widget.border_size_px;
	const y = position.y - widget.border_size_px;
	const sz = UiState.sizes.get(widget.id);
	if (sz)
	{
		Base.GlobalContext!.clearRect(
			x, y,
			sz.width	+ (widget.border_size_px*2),
			sz.height	+ (widget.border_size_px*2));
	}
	else
	{
		Base.GlobalContext!.clearRect(
			x, y,
			widget.rect.width		+ (widget.border_size_px*2),
			widget.rect.height	+ (widget.border_size_px*2));
	}
}

function Ui_PointInRect(widget: Ui_Widget): boolean
{
	Base.assert(UiState.input !== null, "Ui_State must be initialized");
	let result = false;
	if (Base.point_in_rect(UiState.input!.cursor.position, widget.rect))
	{
		result = true;
	}
	return (result);
}

function Ui_MButtonDown(): boolean
{
	Base.assert(UiState.input !== null, "Ui_State must be initialized");
	return (UiState.input!.is_down(Input.MBttn.M_LEFT));
}

function Ui_WidgetIsActive(id: WidgetId): boolean
{
	return (id === UiState.active);
}

function Ui_WidgetIsHot(id: WidgetId): boolean
{
	return (id === UiState.hot);
}

function Ui_WidgetSetActive(id: WidgetId)
{
	UiState.active = id;
}

function Ui_WidgetSetHot(id: WidgetId)
{
	UiState.hot = id;
}

function Ui_WidgetVPadding(padding: [number, number, number, number])
{
	return (
		padding[WidgetPTop] +
		padding[WidgetPBottom]
	);
}

function Ui_WidgetHPadding(padding: [number, number, number, number])
{
	return (
		padding[WidgetPLeft] +
		padding[WidgetPRight]
	);
}

function Ui_WidgetP(v: number, widget: Ui_Widget)
{
	return (widget.padding[v]);
}

function Ui_WidgetRecalculate(widget: Ui_Widget)
{
	const v_padding = Ui_WidgetVPadding(widget.padding);
	const h_padding = Ui_WidgetHPadding(widget.padding);
	widget.actual_height	= widget.rect.height-(widget.border_size_px*2)-v_padding;
	widget.actual_width		= widget.rect.width- (widget.border_size_px*2)-h_padding;
}

function Ui_IsContentCenteredFlagSet(flags: number)
{
	return (Base.has_flag(flags, UiTextCentered) ||
					Base.has_flag(flags, UiImageCentered));
}

function Ui_DrawWidget(widget: Ui_Widget)
{
	let rect = widget.rect;

	let content_offset_x = 0;
	let content_offset_y = 0;
	if (Base.has_flag(widget.flags, UiDrawText) ||
			Base.has_flag(widget.flags, UiDrawImage))
	{

		//rnoba: this will work for now
		let content_rect = widget.text_rect!;
		if (Base.has_flag(widget.flags, UiDrawImage))
		{
			content_rect = Base.Rect(0, 0,
				widget.image_data!.width,
				widget.image_data!.height);
		}

		content_offset_x = content_rect.position.x;
		content_offset_y = content_rect.position.y;
		let aw = widget.rect.width;
		let ah = widget.rect.height;
		if (Base.has_flag(widget.flags, UiDrawText))
		{
			aw = widget.actual_width;
			ah = widget.actual_height;
		}

		if (content_rect.width > widget.actual_width || content_rect.height > widget.actual_height)
		{
			rect.width	= content_rect.width	+ Ui_WidgetP(WidgetPRight, widget);
			rect.height = content_rect.height + Ui_WidgetP(WidgetPBottom, widget);
		}
		else if (Ui_IsContentCenteredFlagSet(widget.flags))
		{
			content_offset_x = Base.round((aw-content_rect.width)/2);
			content_offset_y = Base.round((ah-content_rect.height)/2);
			if (Base.has_flag(widget.flags, UiDrawText))
			{
				content_offset_y = Base.round((ah+content_rect.height)/2);
			}
		}
		else if (Base.has_flag(widget.flags, UiTextCenteredX))
		{
			content_offset_x = Base.round((aw-content_rect.width)/2);
		}
		else if (Base.has_flag(widget.flags, UiTextCenteredY))
		{
			content_offset_y = Base.round((ah-content_rect.height)/2);
			if (Base.has_flag(widget.flags, UiDrawText))
			{
				content_offset_y = Base.round((ah+content_rect.height)/2);
			}
		}
	}

	Ui_WidgetDrawRect(widget);
	if (Base.has_flag(widget.flags, UiDrawText))
	{
		Ui_DrawText(widget.str, widget.text_color,
			rect.position.x + content_offset_x + widget.padding[WidgetPLeft]	+ widget.text_offset.x,
			rect.position.y + content_offset_y + widget.padding[WidgetPTop]		+ widget.text_offset.y,
			widget.text_size_px,
			widget.font,
		);
	}

	if (Base.has_flag(widget.flags, UiDrawImage))
	{
		const image_data = widget.image_data!;
		Base.GlobalContext!.drawImage(
			image_data,
			rect.position.x + content_offset_x,
			rect.position.y + content_offset_y);
	}

	Ui_WidgetRecalculate(widget!); 
	Ui_SetSize(widget!, rect.width, rect.height);
}

export interface WidgetInteracion
{
	widget: Ui_Widget;
	clicked: boolean;
	dragging: boolean;
	hovering: boolean;
}

export function Ui_Cursor()
{
	return (UiState.input!.cursor);
}

export function Ui_DragDelta()
{
	return (Ui_Cursor().position
					.clone()
					.sub(UiState.drag_start));
}

export function Ui_WidgetWithInteraction(widget: Ui_Widget)
{
	const interaction: WidgetInteracion = {
		widget,
		clicked: false,
		dragging: false,
		hovering: false
	}

	const mouse_in_rect = Ui_PointInRect(widget);

	if (Base.has_flag(widget.flags, UiClickable) &&
			mouse_in_rect &&
		 Ui_MButtonDown())
	{
		Ui_WidgetSetHot(widget.id);
		Ui_WidgetSetActive(widget.id);

		if (Ui_IsDragabble(widget) &&
				!UiState.is_dragging)
		{
			UiState.drag_start.set(
				Ui_Cursor().position
				.clone()
				.sub(widget.rect.position)
			);
		}
	}

	if (Base.has_flag(widget.flags, UiClickable) &&
			mouse_in_rect &&
		 !Ui_MButtonDown() &&
		 Ui_WidgetIsActive(widget.id))
	{
		Ui_WidgetSetActive(Base.u640);
		interaction.clicked = true;
		UiState.is_dragging = false;
	}

	if (Base.has_flag(widget.flags, UiClickable) &&
		 !mouse_in_rect &&
		 !Ui_MButtonDown() &&
		 Ui_WidgetIsActive(widget.id))
	{
		Ui_WidgetSetActive(Base.u640);
		Ui_WidgetSetHot(Base.u640);
	}

	if(Base.has_flag(widget.flags, UiClickable) &&
		mouse_in_rect &&
		(Ui_WidgetIsActive(Base.u640) || Ui_WidgetIsActive(widget.id)))
	{
		Ui_WidgetSetHot(widget.id);
		interaction.hovering = true;
	}

	interaction.dragging = UiState.is_dragging;
	Ui_GetStackValues(widget);
	return (interaction);
}

export function Button(text: string, rect: Base.Rect, flags: number = 0): WidgetInteracion 
{
	const widget = Ui_Widget_new(text,
															 rect,
															 UiDrawBorder			|
															 UiTextCentered		|
															 UiDrawText				|
															 UiClickable			|
															 UiDrawBackground | flags);
	return (Ui_WidgetWithInteraction(widget));
}

export function Container(text: string, rect: Base.Rect, flags: number = 0): WidgetInteracion 
{
	const widget = Ui_Widget_new(text, 
															 rect,
															 UiDrawBackground	|
															 UiDrawBorder			| flags);
	return (Ui_WidgetWithInteraction(widget));
}

export function ImageContainer(text: string, rect: Base.Rect, image: OffscreenCanvas, flags: number = 0): WidgetInteracion 
{
	const widget			= Ui_Widget_new(text, rect, UiDrawImage | flags);
	widget.image_data = image;
	return (Ui_WidgetWithInteraction(widget));
}

export function CleanWidgetWithInteraction(text: string, rect: Base.Rect, flags: number): WidgetInteracion 
{
	const widget = Ui_Widget_new(text, rect, flags);
	return (Ui_WidgetWithInteraction(widget));
}

export function Draggable(text: string, rect: Base.Rect, flags: number = 0): WidgetInteracion 
{
	const widget = Ui_Widget_new(text, 
															 rect,
															 UiDrawBackground	|
															 UiDrawBorder			|
															 UiDragabble			|
															 UiClickable			| flags);
	return (Ui_WidgetWithInteraction(widget));
}

export function ScrollBar(text: string, rect: Base.Rect, flags: number = 0)
{
	const container = Container(text+"#"+"container", rect, UiDrawBackground|UiDrawBorder);

	const dragabble = Container(text+"#"+"dragabble",
															Rect(container.widget.rect.position.array(), [30, 30]),
															UiClickable  |
															UiDrawBorder |
														  UiDragabbleY);
	//
	//if (dragabble.dragging)
	//{
	//}
}

export function FrameBegin(dt: number)
{
	UiState.dt = dt;

	if (Ui_WidgetIsActive(Base.u640))
	{
		Ui_WidgetSetHot(Base.u640);
	}

	for (const [id, {frame, widget}] of [...UiState.cleanup.entries()])
	{
		if (UiState.current_frame - frame > 5)
		{
			Ui_RectClear(widget);
			UiState.cleanup.delete(id);
		}
	}
}

export function FrameEnd()
{
	if (!Ui_WidgetIsActive(Base.u640))
	{
		const widget = Ui_FindWidget(UiState.active);
		if (widget &&
				Ui_IsDragabble(widget)) 
		{
			UiState.is_dragging = true;

			const delta = Ui_DragDelta();
			if (!Base.has_flag(widget.flags, UiDragabbleX))
			{
				delta.x = widget.rect.position.x;
			}
			else if (!Base.has_flag(widget.flags, UiDragabbleY))
			{
				delta.y = widget.rect.position.y;
			}

			Ui_SetPosition(widget, delta);
		}
	}

	while (UiState.stack.length)
	{
		Ui_DrawWidget(Ui_PopFront()!);
	}
	UiState.current_frame += 1;
}

export function PositionFromInteraction(parent: WidgetInteracion)
{
	const x = parent.widget.rect.position.x;
	const y = parent.widget.rect.position.y;

	return ([
		x + parent.widget.border_size_px + parent.widget.padding[WidgetPLeft],
		y + parent.widget.border_size_px + parent.widget.padding[WidgetPTop]
	]);
}

export function AbsolutePositionFromInteraction(interaction: WidgetInteracion)
{
	const x = interaction.widget.rect.position.x;
	const y = interaction.widget.rect.position.y;

	return ([
		x,
		y
	]);
}

export function SizeFromInteraction(interaction: WidgetInteracion)
{
	const w = interaction.widget.rect.width-Ui_WidgetHPadding(interaction.widget.padding);
	const h = interaction.widget.rect.height-Ui_WidgetVPadding(interaction.widget.padding);

	return ([w, h]);

}
export function PushBackgroundColor(color: Base.RGBA)
{
	Base.very_stupid_array_push_front(color, UiState.bg_color_stack);
}

export function PushRoundedCorners(tl: number, tr: number, bl: number, br: number)
{
	const radii: [number, number, number, number] = [tl, tr, bl, br];
	Base.very_stupid_array_push_front(radii, UiState.rounded_corner_radii_stack);
}

export function PushPadding(top: number, bottom: number, left: number, right: number)
{
	const padding: [number, number, number, number] = [top, left, bottom, right];
	Base.very_stupid_array_push_front(padding, UiState.padding_stack);
}

export function PushBorderPx(px: number)
{
	Base.very_stupid_array_push_front(px, UiState.border_px_stack);
}

export function PushActiveBackgroundColor(color: Base.RGBA)
{
	Base.very_stupid_array_push_front(color, UiState.active_color_stack);
}

export function PushFont(font: string, size = Ui_DefaultTextSize)
{
	Base.very_stupid_array_push_front([font, size], UiState.font_stack);
}

export function PushHotBackgroundColor(color: Base.RGBA)
{
	Base.very_stupid_array_push_front(color, UiState.hot_color_stack);
}

export function PushBorderColor(color: Base.RGBA)
{
	Base.very_stupid_array_push_front(color, UiState.border_color_stack);
}

export function PushTextColor(color: Base.RGBA)
{
	Base.very_stupid_array_push_front(color, UiState.text_color_stack);
}

export function PushTextOffset(offset: Base.V2)
{
	Base.very_stupid_array_push_front(offset, UiState.text_offset_stack);
}

export function PopBackgroundColor()
{
	return UiState.bg_color_stack.shift();
}

export function PopRoundedCorners()
{
	return UiState.rounded_corner_radii_stack.shift();
}

export function PopBorderPx()
{
	return UiState.border_px_stack.shift();
}

export function PopBorderColor()
{
	return UiState.border_color_stack.shift();
}

export function PopPadding()
{
	return UiState.padding_stack.shift();
}

export function PopFont()
{
	return UiState.font_stack.shift();
}

export function PopActiveBackgroundColor()
{
	return UiState.active_color_stack.shift();
}

export function PopHotBackgroundColor()
{
	return UiState.hot_color_stack.shift();
}

export function PopTextColor()
{
	return UiState.text_color_stack.shift();
}

export function PopTextOffset()
{
	return UiState.text_offset_stack.shift();
}

export function PushGeneralBackgroundColor(color: Base.RGBA)
{
	PushBackgroundColor(color);
	PushActiveBackgroundColor(color);
	PushHotBackgroundColor(color);
}

export function PopGeneralBackgroundColor()
{
	PopBackgroundColor();
	PopActiveBackgroundColor();
	PopHotBackgroundColor();
}

function Ui_PopStacks()
{
	PopBackgroundColor();
	PopRoundedCorners();
	PopBorderPx();
	PopActiveBackgroundColor();
	PopHotBackgroundColor();
	PopPadding();
	PopBorderColor();
	PopTextColor();
	PopFont();
	PopTextOffset();
}

function Ui_GetStackValues(widget: Ui_Widget)
{
	widget.background_color = UiState.bg_color_stack[0]							|| widget.background_color;
	widget.active_color			= UiState.active_color_stack[0]					|| widget.active_color;
	widget.hot_color				= UiState.hot_color_stack[0]						|| widget.hot_color;
	widget.radii						= UiState.rounded_corner_radii_stack[0]	|| widget.radii;
	widget.border_size_px		= UiState.border_px_stack[0]						|| widget.border_size_px;
	widget.padding					= UiState.padding_stack[0]							|| widget.padding;
	widget.border_color			= UiState.border_color_stack[0]					|| widget.border_color;
	widget.text_color				= UiState.text_color_stack[0]						|| widget.text_color;
	widget.text_offset			= UiState.text_offset_stack[0]					|| widget.text_offset;
	if (UiState.font_stack[0])
	{
		widget.font					= UiState.font_stack[0][0];
		widget.text_size_px	= UiState.font_stack[0][1];
	}
	if (UiState.border_px_stack[0] === 0)
	{
		widget.flags &= ~(UiDrawBorder);
	}
}

export function DrawInventory(sprites: OffscreenCanvas[]): boolean 
{
	let close = false;
	PushRoundedCorners(5, 5, 5, 5);
	PushBorderPx(3);
	PushGeneralBackgroundColor(Base.RGBA(217, 237, 236));
	PushBorderColor(Base.RGBA(177, 177, 177));
	PushTextColor(Base.RGBA(75, 78, 94, 0.8));
	PushFont("GamesStudios", 20);
	//PushPadding(0, 0, 0, 0);
	PushTextOffset(Base.V2.New(0, 20));
	const draggable										= Draggable("INVENTORY", Rect([10, 10], [500, 350]), UiDrawText|UiTextCenteredX);
	const draggable_absolute_position = AbsolutePositionFromInteraction(draggable); 
	const draggable_size							= SizeFromInteraction(draggable);
	PopTextOffset();
	//PopPadding();
	PopFont();
	PopTextColor();
	PopBorderColor();
	PopGeneralBackgroundColor();
	PopBorderPx();
	PopRoundedCorners();

	const close_button_position = [
		draggable_absolute_position[0] + draggable_size[0] - 10 - Ui_WidgetP(WidgetPLeft, draggable.widget),
		draggable_absolute_position[1] + Ui_WidgetP(WidgetPTop, draggable.widget),
	];

	PushBorderColor(Base.RGBA(177, 177, 177));
	PushTextColor(Base.RGBA(177, 177, 177));
	PushTextOffset(Base.V2.New(-10, 10));
	if (CleanWidgetWithInteraction("X", Rect(close_button_position, [10, 10]),
																 UiDrawText|
																 UiClickable|
																 UiTextCentered).clicked)
	{
		close = true;
	}
	PopTextOffset();
	PopTextColor();
	PopBorderColor();

	PushGeneralBackgroundColor(Base.RGBA(241, 241, 241));
	PushBorderPx(1);
	PushBorderColor(Base.RGBA(177, 177, 177));
	const offset_y = 50;
	const container_position = [
		draggable_absolute_position[0] + Ui_WidgetP(WidgetPLeft, draggable.widget),
		draggable_absolute_position[1] + offset_y + Ui_WidgetP(WidgetPTop, draggable.widget)
	];
	const inventory_area = Container("container", Rect(
		container_position,
		[
			draggable_size[0]-Ui_WidgetP(WidgetPRight, draggable.widget),
			draggable_size[1]-offset_y-Ui_WidgetP(WidgetPBottom, draggable.widget)
		]
	), UiClickable);
	PopBorderColor();
	PopBorderPx();
	PopGeneralBackgroundColor();

	const inventory_area_position = PositionFromInteraction(inventory_area);
	let y = 0;
	for (let x = 0; x < 10; x += 1)
	{
		const nx = inventory_area_position[0] + Base.floor(x % Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacing;
		const ny = inventory_area_position[1] + Base.floor(x / Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacing;
		PushRoundedCorners(3, 3, 3, 3);
		PushGeneralBackgroundColor(Base.RGBA(204, 204, 204));
		if (ImageContainer("image :)" + x,
			Rect([nx, ny], [
				Ui_InventorySlotSize,
				Ui_InventorySlotSize
			]),
			sprites[x],
			UiClickable|UiDrawBackground|UiImageCentered).clicked)
		{
			console.log(x);
		}
		PopGeneralBackgroundColor();
		PushRoundedCorners(3, 3, 3, 3);
	}

	ScrollBar("Scroll", Rect(
		[container_position[0] + Ui_InventoryColumns * Ui_InventorySlotSize,
		container_position[1]],
		[50,
		100]
	));
	return (close);
}
