import * as Base	from "./base.js";
import * as Input from "./input.js";
import * as Sprite from "./sprite.js";

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
const Ui_InventorySlotSize	= 52;
const Ui_InventoryColumns		= 5;
const Ui_DefaultBorderColor = Base.RGBA(0, 0, 0);
const Ui_DefaultTextColor		= Base.RGBA(255, 255, 255);
const Ui_InventorySpacingX	= 1.1;
const Ui_InventorySpacingY	= 1.1;

function Ui_DrawRoundedRectagle(
	rect: Base.Rect, 
	radii: [number, number, number, number], 
	px: number,
	fill: boolean = false,
	stroke: boolean = true)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawRoundedRectagle()` GlobalContext must be initialized");
	const ctx = Base.GlobalContext!; 

	Base.GlobalContext!.lineWidth = px;
	const [r00, r01, r10, r11] = radii;

	const [x, y] = rect.position.array();
	const { width, height } = rect;
  ctx.beginPath();

  ctx.moveTo(x + r01, y);
  ctx.lineTo(x + width - r01, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r01);

  ctx.lineTo(x + width, y + height - r11);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r11, y + height);

  ctx.lineTo(x + r10, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r10);

  ctx.lineTo(x, y + r00);
  ctx.quadraticCurveTo(x, y, x + r00, y);
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
	if (Ui_WidgetIsFocused(widget!.id))
	{
		color = Base.RGBA_FULL_RED;
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
	focused: WidgetId;
	is_dragging: boolean; 
	drag_start: Base.V2;
	current_frame: number;
	dt: number;
	cleanup: Map<WidgetId, {widget: Ui_Widget, frame: number}>; 
	draggables: Map<WidgetId, Ui_Draggable>;
	view_offsets: Map<WidgetId, Base.V2>;
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
export const UiImageCentered		= UiImageCenteredX|UiImageCenteredY;
export const UiDragabbleX				= 1 << 9;
export const UiDragabbleY				= 1 << 10;
export const UiDragabble				= UiDragabbleX|UiDragabbleY; 
export const UiFitContent				= 1 << 11;

export const UiScroll						= 1 << 12;

export const UiScrollViewX			= 1 << 13; 
export const UiScrollViewY			= 1 << 14; 
export const UiScrollView				= 1 << 15;

export const UiViewClampX			  = 1 << 16; 
export const UiViewClampY			  = 1 << 17; 
export const UiViewClamp			  = 1 << 18; 

export const UiPersistSize			= 1 << 19;

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
	focused: Base.u640,
	sizes: new Map(),
	view_offsets: new Map(),
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

function Ui_SetPosition(widget: Ui_Widget, delta: Base.V2, reset_drag_start = true)
{
	if (!Ui_IsDragabble(widget))
	{
		console.warn("position of non draggables elements are not persistant");
		return;
	}

	const draggable = UiState.draggables.get(widget.id)!;
	const new_position = delta.add(widget.rect.position);
	if (draggable)
	{
		Ui_RectClearPos(widget, draggable.previous_position);
		draggable.previous_position.set(widget.rect.position);
		draggable.position.set(new_position);
	}
	else
	{
		UiState.draggables.set(widget.id, {
			previous_position: widget.rect.position,
			position: new_position,
			frame: UiState.current_frame
		})!;
	}
	if (reset_drag_start)
	{
		UiState.drag_start.set(UiState.input!.cursor.position);
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
	return (Base.Rect(x, y, width - Ui_DefaultWidgetPaddingPxH, height - Ui_DefaultWidgetPaddingPxV));
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
	view_width: number;
	view_height: number;
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
	image_data: ImageBitmap | null;
	image_rect: Base.Rect  | null;
	text_offset: Base.V2;
	view_offset: Base.V2;
}

function Ui_Widget_new(
	text: string,
	rect: Base.Rect,
	flags: number,
	view_width: null | number = null,
	view_height: null | number = null,
)
{
	let hash_part = text;;

	if (text.includes("#"))
	{
		const split = text.split("#");
		hash_part = split[0];
		text = split[1];
	}
	const id: WidgetId	= Base.hash_string(hash_part);
	const from_stack		= Ui_FindWidget(id);
	if (from_stack)
	{
		return (from_stack);
	}

	if (!view_width)
	{
		view_width = rect.width;
	}

	if (!view_height)
	{
		view_height = rect.height;
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
		view_offset: Base.V2.Zero(),
		image_rect: null,
		text_offset: Base.V2.Zero(),
		view_width,
		view_height,
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
		actual_width: rect.width+(Ui_DefaultBorderSize*2)-Ui_DefaultWidgetPaddingPxH2,
		actual_height: rect.height+(Ui_DefaultBorderSize*2)-Ui_DefaultWidgetPaddingPxV2,
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
	if (Base.has_flag(widget.flags, UiPersistSize))
	{
		const size = UiState.sizes.get(id);
		if (size)
		{
			widget.rect.width		= size.width;
			widget.rect.height	= size.height;
		}
	}
	const view_offset = UiState.view_offsets.get(id);
	if (view_offset)
	{
		widget.view_offset.x = view_offset.x;
		widget.view_offset.y = view_offset.y;
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

function Ui_WidgetIsFocused(id: WidgetId): boolean
{
	return (id === UiState.focused);
}

function Ui_WidgetSetActive(id: WidgetId)
{
	UiState.active = id;
}

function Ui_WidgetSetFocused(id: WidgetId)
{
	UiState.focused = id;
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
	widget.actual_height	= widget.rect.height+(widget.border_size_px*2)-v_padding;
	widget.actual_width		= widget.rect.width+(widget.border_size_px*2)-h_padding;
}

function Ui_IsContentCenteredFlagSet(flags: number)
{
	return (Base.has_flag(flags, UiTextCentered) ||
					Base.has_flag(flags, UiImageCentered));
}

function Ui_DrawWidget(widget: Ui_Widget)
{
	const rect = widget.rect;

	let content_offset_x = 0;
	let content_offset_y = 0;
	let would_resize = false;
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
			if (widget.image_rect)
			{
				content_rect = widget.image_rect;
			}
		}
		content_offset_x = content_rect.position.x;
		content_offset_y = content_rect.position.y;
		if (Base.has_flag(widget.flags, UiFitContent)		&&
				(content_rect.width	> widget.actual_width		||
				content_rect.height > widget.actual_height)
			 )
		{
			// resize box to fit content
			rect.width	= content_rect.width;
			rect.height = content_rect.height;
		}

		else if (Ui_IsContentCenteredFlagSet(widget.flags))
		{
			content_offset_x = Base.round((rect.width-content_rect.width)/2);
			content_offset_y = Base.round((rect.height-content_rect.height)/2);
			if (Base.has_flag(widget.flags, UiDrawText))
			{
				content_offset_y = Base.round((rect.height+content_rect.height)/2);
			}
		}
		else if (Base.has_flag(widget.flags, UiTextCenteredX))
		{
			content_offset_x = Base.round((rect.width-content_rect.width)/2);
		}
		else if (Base.has_flag(widget.flags, UiTextCenteredY))
		{
			content_offset_y = Base.round((rect.height-content_rect.height)/2);
			if (Base.has_flag(widget.flags, UiDrawText))
			{
				content_offset_y = Base.round((rect.height+content_rect.height)/2);
			}
		}

		if (content_rect.width	> widget.actual_width ||
				content_rect.height > widget.actual_height)
		{
			would_resize = true;
		}
	}

	Ui_WidgetDrawRect(widget);
	if (Base.has_flag(widget.flags, UiDrawText))
	{
		let str = widget.str;
		if (would_resize && Base.has_flag(widget.flags, UiDrawText))
		{
			let content_rect = widget.text_rect!;
			let it = 0;
			while (content_rect.width	>= widget.actual_width)
			{
				str = str.substring(0, str.length-1);
				content_rect = Ui_RectFromText(str, widget.text_size_px, widget.font);
				if (it++ >= 1000)
				{
					console.warn("content rect clipping x: possible infinite loop");
					break;
				}
			}
			str = str.substring(0, str.length-2);
			str += "...";
		}

		Ui_DrawText(str, widget.text_color,
			rect.position.x + content_offset_x + widget.padding[WidgetPLeft]	+ widget.text_offset.x,
			rect.position.y + content_offset_y + widget.padding[WidgetPTop]		+ widget.text_offset.y,
			widget.text_size_px,
			widget.font,
		);
	}

	if (Base.has_flag(widget.flags, UiDrawImage))
	{
		const image_data = widget.image_data!;
		if (widget.image_rect)
		{
			Base.GlobalContext!.drawImage(
				image_data,
				widget.image_rect.position.x,
				widget.image_rect.position.y,
				would_resize ? rect.width		: widget.image_rect.width,
				would_resize ? rect.height	: widget.image_rect.height,
				rect.position.x + content_offset_x,
				rect.position.y + content_offset_y,
				rect.width	- (would_resize ? 0 : content_offset_x*2),
				rect.height - (would_resize ? 0 : content_offset_y*2)
			);
		}
		else
		{
			Base.GlobalContext!.drawImage(
				image_data,
				0, would_resize ? content_offset_y : 0,
				rect.width	- content_offset_x,
				rect.height - content_offset_y,
				rect.position.x + content_offset_x,
				rect.position.y + content_offset_y,
				rect.width	- Ui_WidgetP(WidgetPLeft, widget) - content_offset_x,
				rect.height - Ui_WidgetP(WidgetPBottom, widget) - content_offset_y,
			);
		}
	}

	Ui_WidgetRecalculate(widget!); 
	//Ui_SetSize(widget!, rect.width, rect.height);
}

export interface WidgetInteracion
{
	widget: Ui_Widget;
	clicked: boolean;
	dragging: boolean;
	hovering: boolean;

	scroll_x: number;
	scroll_y: number;
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
		hovering: false,
		scroll_x: 0,
		scroll_y: 0,
	}

	const mouse_in_rect = Ui_PointInRect(widget);

	if (Base.has_flag(widget.flags, UiClickable) &&
			mouse_in_rect &&
			Ui_MButtonDown() &&
		 !UiState.is_dragging)
	{
		Ui_WidgetSetHot(widget.id);
		Ui_WidgetSetActive(widget.id);
		Ui_WidgetSetFocused(widget.id);
		UiState.drag_start.set(Ui_Cursor().position);
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

	if (Base.has_flag(widget.flags, UiClickable) &&
		 !mouse_in_rect &&
		 Ui_MButtonDown() &&
		 Ui_WidgetIsFocused(widget.id))
	{
		Ui_WidgetSetFocused(Base.u640);
	}

	if(Base.has_flag(widget.flags, UiClickable) &&
		mouse_in_rect &&
		(Ui_WidgetIsActive(Base.u640) || Ui_WidgetIsActive(widget.id)))
	{
		Ui_WidgetSetHot(widget.id);
		interaction.hovering = true;
	}

	if (Base.has_flag(widget.flags, UiScroll) &&
			mouse_in_rect)
	{
		let evt = UiState.input!.next_event();
		for (; evt; evt = UiState.input!.next_event())
		{
			if (!["wheel"].includes(evt[0]))
			{
					continue;
			}

			let { deltaX: dx, deltaY: dy } = evt[1] as { deltaX: number, deltaY: number};
			if (UiState.input!.is_down(Input.KKey.KEY_LShift))
			{
				let tmp = dx;
				dx = dy;
				dy = tmp;
			}
			interaction.scroll_x += dx;
			interaction.scroll_y += dy;
		}
	}

	let scrolled = false;
	if (Base.has_flag(widget.flags, UiScrollView) &&
			mouse_in_rect)
	{
		let evt = UiState.input!.next_event();
		for (; evt; evt = UiState.input!.next_event())
		{
			if (!["wheel"].includes(evt[0]))
			{
					continue;
			}

			let { deltaX: dx, deltaY: dy } = evt[1] as { deltaX: number, deltaY: number};
			if (UiState.input!.is_down(Input.KKey.KEY_LShift))
			{
				let tmp = dx;
				dx = dy;
				dy = tmp;
			}

			if (!Base.has_flag(widget.flags, UiScrollViewX))
			{
				if (dy == 0)
				{
					dy = dx;
				}
				dx = 0;
			}

			if (!Base.has_flag(widget.flags, UiScrollViewY))
			{
				if (dx == 0)
				{
					dx = dy;
				}
				dy = 0;
			}
			widget.view_offset.x += dx;
			widget.view_offset.y += dy;
			scrolled = true;
		}
	}

	if (scrolled && Base.has_flag(widget.flags, UiViewClamp))
	{
		const max_view_x = Math.max(0, widget.view_width	- widget.rect.width);
		const max_view_y = Math.max(0, widget.view_height - widget.rect.height);
    if(Base.has_flag(widget.flags, UiViewClampX))
		{
			widget.view_offset.x = Base.Clamp(widget.view_offset.x, 0, max_view_x);
		}
    if(Base.has_flag(widget.flags, UiViewClampY))
		{
			widget.view_offset.y = Base.Clamp(widget.view_offset.y, 0, max_view_y);
		}
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
															 UiFitContent			|
															 UiDrawText				|
															 UiClickable			|
															 UiDrawBackground | flags);
	return (Ui_WidgetWithInteraction(widget));
}

export function Container(
	text: string,
	rect: Base.Rect,
	flags: number = 0,
	view_width: null | number = null,
	view_height: null | number = null): WidgetInteracion 
{
	const widget = Ui_Widget_new(text, 
															 rect,
															 UiDrawBackground	|
															 UiDrawBorder			| flags,
															 view_width, view_height);
	return (Ui_WidgetWithInteraction(widget));
}

export function TextInput(state: {value: string}, text: string, rect: Base.Rect, flags: number = 0)
{
	const text_rect = Container(text+"#"+state.value,
															rect,
															UiClickable			|
															UiDrawText			|
															UiTextCenteredY | flags);

	let evt = UiState.input!.next_event();
	for (; evt; evt = UiState.input!.next_event())
	{
		if (!["keyup", "keydown"].includes(evt[0]))
		{
				continue;
		}
		const is_key_down = UiState.input!.is_down(evt[1].keyCode as number);

		if (Ui_WidgetIsFocused(text_rect.widget.id))
		{
			if (is_key_down)
			{
				Ui_WidgetSetActive(text_rect.widget.id);
				state.value += evt[1].key;
			}
		}
	}
	return (state);
}

export function ImageContainer(
	text: string,
	rect: Base.Rect,
	image: ImageBitmap,
	flags: number = 0,
	img_rect: null | Base.Rect = null,
	view_width: null | number = null,
	view_height: null | number = null): WidgetInteracion 
{
	const widget			= Ui_Widget_new(text, rect, UiDrawImage | flags, view_width, view_height);
	widget.image_data = image;
	widget.image_rect = img_rect;
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

export function ScrollBar(text: string, rect: Base.Rect, pixels: number, flags: number = 0, parent_id: WidgetId)
{
	PushBorderPx(1);
	const container = CleanWidgetWithInteraction(text+"-"+"container", rect, UiDrawBorder|UiDrawBackground|UiClickable);
	PopBorderPx();

	const pct		= Base.Clamp(rect.height / pixels, 0, 1);
	const size	= rect.height * pct;

	const draggable_pos = container.widget.rect.position.array();
	draggable_pos[0] += (rect.width-(rect.width/2))/2-(container.widget.border_size_px);
	PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0));
	PushBorderPx(1);
	const dragabble = Container(text+"-"+"dragabble",
															Rect(draggable_pos, [rect.width/2, size]),
																UiClickable  |
																UiDrawBorder |
																(pct < 1 ? UiDragabbleY : 0)
														 );
	PopBorderPx();
	PopGeneralBackgroundColor();
	if (pct >= 1)
	{
		return (0);
	}

	const dragabble_start_point_y				= rect.position.y + rect.height; 
	const dragabble_current_position_y	= dragabble.widget.rect.position.y;

	const current			= Base.floor(dragabble_current_position_y + size);
	const total_amt		= dragabble_start_point_y - Base.floor(rect.position.y + size);
	const current_amt = Base.floor(dragabble_start_point_y - current);
	if (UiState.is_dragging && Ui_WidgetIsActive(dragabble.widget.id))
	{
		const delta		= Ui_DragDelta();
		const delta_y = delta.y * UiState.dt * 50;
		//const next_y	= dragabble_current_position_y + Base.round(delta_y);

		//TODO9(rnoba): fix dragging
		Ui_SetPosition(dragabble.widget, Base.V2.New(0, delta_y));
	}
	if (UiState.is_dragging && Ui_WidgetIsActive(parent_id))
	{
		const delta	= Ui_DragDelta();
		Ui_SetPosition(dragabble.widget, Base.V2.New(delta.x, delta.y), false);
	}

	const progress = (total_amt-current_amt)/total_amt; 
	return (progress);
}

export function FrameBegin(dt: number)
{
	UiState.dt = dt;

	if (Ui_WidgetIsActive(Base.u640))
	{
		Ui_WidgetSetHot(Base.u640);
		UiState.is_dragging = false;
	}

	for (const [id, {frame, widget}] of [...UiState.cleanup.entries()])
	{
		if (UiState.current_frame - frame > 5)
		{
			Ui_RectClear(widget);
			UiState.cleanup.delete(id);
		}
	}
	Ui_PopStacks();
}

// TODO(rnoba): code cleanup
export function FrameEnd()
{
	if (!Ui_WidgetIsActive(Base.u640))
	{
		const widget = Ui_FindWidget(UiState.active);
		if (widget && Ui_IsDragabble(widget)) 
		{
			UiState.is_dragging = true;

			const delta = Ui_DragDelta();
			if (Base.has_flag(widget.flags, UiDragabble))
			{
				Ui_SetPosition(widget, delta);
			}
		}
	}

	while (UiState.stack.length)
	{
		const widget = Ui_PopFront()!
		if (Base.has_flag(widget.flags, UiScrollView))
		{
			UiState.view_offsets.set(widget.id, widget.view_offset);
		}
		if (Base.has_flag(widget.flags, UiPersistSize))
		{
			UiState.sizes.set(widget.id, {
				width: widget.rect.width,
				height: widget.rect.height,
			});
		}
		Ui_DrawWidget(widget);
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


interface InventoryState
{
	selected_item: number;
	should_close: boolean;
}

const Inventory: InventoryState = {
	selected_item: 0,
	should_close: true 
}

export function InventoryIsOpen(): boolean
{
	return (!Inventory.should_close)
}

export function DrawInventory(sprites: ImageBitmap[])
{
	//let close = false;
	PushRoundedCorners(5, 5, 5, 5);
	PushBorderPx(3);
	PushGeneralBackgroundColor(Base.RGBA(217, 237, 236, 1));
	PushBorderColor(Base.RGBA(177, 177, 177));
	PushTextColor(Base.RGBA(75, 78, 94, 0.8));
	PushFont("GamesStudios", 18);
	PushTextOffset(Base.V2.New(0, 5));
	const draggable										= Draggable("INVENTORY", Rect([10, 10], [500, 300]));
	const draggable_absolute_position = AbsolutePositionFromInteraction(draggable); 
	const draggable_size							= SizeFromInteraction(draggable);
	PopTextOffset();
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
	PushTextOffset(Base.V2.New(-2, 0));
	if (CleanWidgetWithInteraction("x", Rect(close_button_position, [10, 10]),
																 UiDrawText|
																 UiClickable|
																 UiTextCentered).clicked)
	{
		Inventory.should_close = true;
	}
	PopTextOffset();
	PopTextColor();
	PopBorderColor();

	PushGeneralBackgroundColor(Base.RGBA(255, 255, 255, 1));
	PushBorderPx(1);
	PushBorderColor(Base.RGBA(177, 177, 177));
	const offset_y = 20;
	const inventory_area_height = draggable_size[1]-offset_y-Ui_WidgetP(WidgetPBottom, draggable.widget);
	const inventory_area_width	= draggable_size[0]-Ui_WidgetP(WidgetPRight, draggable.widget);
	const container_position = [
		draggable_absolute_position[0] + Ui_WidgetP(WidgetPLeft, draggable.widget),
		draggable_absolute_position[1] + offset_y + Ui_WidgetP(WidgetPTop, draggable.widget)
	];
	const inventory_area = Container("container", Rect(
		container_position,
		[
			inventory_area_width,
			inventory_area_height
		]
	), UiClickable);
	PopBorderColor();
	PopBorderPx();
	PopGeneralBackgroundColor();
	const inventory_slots		= 300;
	const scroll_bar_height = Base.floor(inventory_slots / Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacingY;
	const scrollbar_height	= inventory_area_height-inventory_area.widget.border_size_px*2-2;
	const scrollbar_width		= 20;
	PushRoundedCorners(3, 3, 3, 3);
	const offset = ScrollBar("Scroll", Rect(
		[
			container_position[0] + Ui_InventorySlotSize * Ui_InventoryColumns * Ui_InventorySpacingX + 5,
			container_position[1] + inventory_area.widget.border_size_px * 2 + Ui_WidgetP(WidgetPTop, inventory_area.widget)
		],
		[
			scrollbar_width,
			scrollbar_height
		]
	), scroll_bar_height, 0, draggable.widget.id); 
	PopRoundedCorners();

	const content_offset = -(offset) * (scroll_bar_height - inventory_area_height);
	const inventory_area_position = PositionFromInteraction(inventory_area);

	PushBorderPx(2);
	PushGeneralBackgroundColor(Base.RGBA_FULL_BLUE);
	PushRoundedCorners(3, 3, 3, 3);
	let x		= 0;
	for (x	= 0; x < inventory_slots; x += 1)
	{
		const nx = inventory_area_position[0] + Base.floor(x % Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacingX;
		let		ny = inventory_area_position[1] + Base.floor(x / Ui_InventoryColumns) * Ui_InventorySlotSize * Ui_InventorySpacingY + content_offset;
		let height = Ui_InventorySlotSize;
		if (ny + Ui_InventorySlotSize < inventory_area_position[1] || ny > inventory_area_position[1] + inventory_area_height)
		{
			continue;
		}
		if (ny + Ui_InventorySlotSize > inventory_area_position[1] + inventory_area_height)
		{
			const cut_amt = (ny + Ui_InventorySlotSize) - (inventory_area_position[1] + inventory_area_height);
			height -= Base.round(cut_amt) + 5;
		}
		if (ny < inventory_area_position[1])
		{
			const cut_amt = inventory_area_position[1] - (ny);
			height -= Base.round(cut_amt);
			ny += cut_amt;
		}
		if (height <= 0)
		{
			continue;
		}
		if (ImageContainer("inventory-slot" + x,
			Rect([nx, ny], [
				Ui_InventorySlotSize,
				height
			]),
			sprites[x],
			UiClickable|UiDrawBackground|UiImageCentered|UiDrawBorder).clicked)
		{
			Inventory.selected_item = x;
		}
	}
	PopBorderPx();
	PopGeneralBackgroundColor();
	PopRoundedCorners();

	PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0));
	PushBorderPx(0);
	const start_right_side = container_position[0]	+
													 Ui_InventorySlotSize		*
													 Ui_InventoryColumns		*
													 Ui_InventorySpacingX + 10;

	const left_side_width = start_right_side - container_position[0] + scrollbar_width + 5;
	const width						= inventory_area_width - left_side_width;
	const height					= inventory_area_height - 5;
	const inv_left_area = Container("container--left", Rect(
		[
			start_right_side +  scrollbar_width,
			container_position[1] +
			inventory_area.widget.border_size_px * 2 +
			Ui_WidgetP(WidgetPTop, inventory_area.widget)
		],
		[
			width,
			height
		]
	), UiDrawBorder);
	const position = AbsolutePositionFromInteraction(inv_left_area); 
	PopBorderPx();
	PopGeneralBackgroundColor();
	if (Inventory.selected_item != -1)
	{
		ImageContainer("selected item",
								 Rect([position[0], position[1]], [width, height/2]),
								 sprites[Inventory.selected_item],
								 UiDrawBackground|UiImageCentered)

		PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0));
		PushTextColor(Base.RGBA(0, 0, 0, 0.8));
		PushBorderPx(1);
		if (Button("Place", Rect([position[0], position[1] + height - 20 - 10], [100, 20])).clicked)
		{
			console.log("place", Inventory.selected_item);
		}
		PopBorderPx();
		PopTextColor();
		PopGeneralBackgroundColor();
	}
}

const default_sprite_size = 64;
const from_source: Sprite.Sprite[] = [];
const altered_sprite_sizes: Array<[number, number]> = [];

// since each sprite has a diferent position in the
// source image it can be used as an 'id'
function FindSpriteBySourceCoords(x: number, y: number)
{
	let found: Sprite.Sprite | null = null;
	for (let i = 0; i < from_source.length; i += 1)
	{
		if (from_source[i].rect.position.x == x && from_source[i].rect.position.y === y)
		{
			found = from_source[i];
			break;
		}
	}
	return (found);
}

interface LoadSpriteData
{
	name: {value: string};
	description: {value: string};
}

const load_sprite_data: LoadSpriteData = {
	name: {value: ""},
	description:  {value: ""}
}

const SpriteLoaderSlotSize = 72;
interface SpriteLoaderState
{
	selected_sprite: number;
}

const sprite_loader_state: SpriteLoaderState = {
	selected_sprite: 0,
}

export function DrawSpriteLoader(source_image: ImageBitmap)
{
	PushRoundedCorners(0, 0, 0, 0);
	PushBorderPx(1);
	PushGeneralBackgroundColor(Base.RGBA(0, 0, 0, 0.1));
	Base.GlobalContext!.clearRect(0, 0, 1440, 900);
	const image_container = Container("sprite-loader-container", Rect([30, 30], [800, 600]),
																				 UiScrollView|UiScrollViewY|UiScrollViewX|UiViewClamp|UiViewClampX|UiViewClampY|UiDrawBorder|UiDrawBackground,
																				 source_image.width,
																				 source_image.height);
	const image_container_visible_size = SizeFromInteraction(image_container);
	const image_container_abs_position = AbsolutePositionFromInteraction(image_container);
	const image_container_position = PositionFromInteraction(image_container);
	const image = ImageContainer(
		"sprite-loader-container-image",
		Rect(
			[
				image_container_position[0] - image_container.widget.view_offset.x,
				image_container_position[1] - image_container.widget.view_offset.y
			],
			[image_container_visible_size[0], image_container_visible_size[1]]),
		source_image,
		0,
		Base.Rect(image_container.widget.view_offset.x,
							image_container.widget.view_offset.y, source_image.width, source_image.height));
	PopGeneralBackgroundColor();
	PopBorderPx();
	PopRoundedCorners();

	// scan image and crop sprites
	const count_x = Base.floor(source_image.width / default_sprite_size);
	const count_y = Base.floor(source_image.height / default_sprite_size);

	for (let y = 0; y < count_y; y += 1)
	{
		for (let x = 0; x < count_x; x += 1)
		{
			const sprite_x = x * default_sprite_size;
			const sprite_y = y * default_sprite_size;
			if (FindSpriteBySourceCoords(sprite_x, sprite_y))
			{
				continue;
			}
			const sprite = Sprite.Sprite_new(
				Base.Rect(sprite_x,
									sprite_y,
									default_sprite_size, default_sprite_size), 0, 0);
			console.log("push");
			from_source.push(sprite);
			altered_sprite_sizes.push([sprite.rect.width, sprite.rect.height])
		}
	}

	const loaded_container_x = image_container_visible_size[0] + 30 + 30;
	const loaded_container_y = 30;
	const loaded_container = Container("loaded-container",
																		 Rect(
																			 [
																				 loaded_container_x,
																				 loaded_container_y
																			 ],
																			 [
																				 506,
																				 600
																			 ]),
																			 UiDrawBorder|UiScrollViewY|UiScrollView|UiViewClamp|UiViewClampY,
																			 null, (from_source.length / 6 * SpriteLoaderSlotSize * Ui_InventorySpacingY) + 2 * from_source.length/6);

	const loaded_container_pos	= PositionFromInteraction(loaded_container);
	const loaded_container_size	= SizeFromInteraction(loaded_container);
	const loaded_container_col	= Base.floor(loaded_container_size[0] / SpriteLoaderSlotSize);
	PushBorderPx(1);
	PushRoundedCorners(0, 0, 0, 0);
	for (let x = 0; x < from_source.length; x++)
	{
		const nx = loaded_container_pos[0] + Base.floor(x % loaded_container_col) * SpriteLoaderSlotSize * Ui_InventorySpacingX + (Base.round(SpriteLoaderSlotSize/4));
		const ny = loaded_container_pos[1] + Base.floor(x / loaded_container_col) * SpriteLoaderSlotSize * Ui_InventorySpacingY - loaded_container.widget.view_offset.y;
		const sprite = from_source[x];
		if (ImageContainer("loaded-slot" + x,
			Rect([nx, ny], [
				SpriteLoaderSlotSize,
				SpriteLoaderSlotSize,
			]),
			source_image,
			UiClickable|UiImageCentered|UiDrawBorder,
			sprite.rect).clicked)
		{
			sprite_loader_state.selected_sprite = x;
		}
	}
	PopRoundedCorners();
	PopBorderPx();

	const selected_sprite = from_source[sprite_loader_state.selected_sprite];
	const selected_sprite_offset_x = image_container_position[0] + selected_sprite.rect.position.x - image_container.widget.view_offset.x;
	const selected_sprite_offset_y = image_container_position[1] + selected_sprite.rect.position.y - image_container.widget.view_offset.y;

	if ((selected_sprite_offset_x + selected_sprite.rect.width) > image_container_visible_size[0])
	{
		image_container.widget.view_offset.x += 1000 * UiState.dt;
	}
	else if ((image_container_position[0] + selected_sprite.rect.position.x - selected_sprite.rect.width/2) < image_container.widget.view_offset.x)
	{
		image_container.widget.view_offset.x -= 1000 * UiState.dt;
	}

	if ((selected_sprite_offset_y + selected_sprite.rect.height) > image_container_visible_size[1])
	{
		image_container.widget.view_offset.y += 1000 * UiState.dt;
	}
	else if ((image_container_position[1] + selected_sprite.rect.position.y - selected_sprite.rect.height/2) < image_container.widget.view_offset.y)
	{
		image_container.widget.view_offset.y -= 1000 * UiState.dt;
	}

	const altered_size = altered_sprite_sizes[sprite_loader_state.selected_sprite];
	if (selected_sprite_offset_x < image_container_visible_size[0] &&
			selected_sprite_offset_y < image_container_visible_size[1])
	{
		PushRoundedCorners(0, 0, 0, 0);
		PushBorderPx(1);
		PushTextColor(Base.RGBA_FULL_BLUE);
		PushGeneralBackgroundColor(Base.RGBA(255, 255, 255, 0.4))
		Container(`selected-sprite-overlay#${altered_size[0]}-${altered_size[1]}`,
			Rect(
				[
					selected_sprite_offset_x,
					selected_sprite_offset_y
				], 
				[
					altered_size[0],
					altered_size[1],
				]
			), UiDrawBorder|UiDrawText|UiTextCentered)
		PopGeneralBackgroundColor();

		for (let i = 0; i < 4; i++)
		{
			const x = Base.floor(i % 2);
			const y = Base.floor(i / 2);
			const offset_x = (x === 0 && x === y) ? 0 : (x === 1 ? 10 : 0);
			const offset_y = (y === 1) ? 10 : 0;

			const dragabble = CleanWidgetWithInteraction(
				"selected-sprite-overlay-drag-area" + i,
				Base.Rect(
					selected_sprite_offset_x + (x * selected_sprite.rect.width - offset_x),
					selected_sprite_offset_y + (y * selected_sprite.rect.height - offset_y), 10, 10),
				UiClickable|UiDrawBackground|UiDragabble);
			if (UiState.is_dragging && Ui_WidgetIsActive(dragabble.widget.id))
			{
				const delta = Ui_DragDelta();
				altered_size[0] += delta.x * x;
				altered_size[1] += delta.y * y;
				//console.log(x, y)
			}
		}

		PopTextColor();
		PopBorderPx();
		PopRoundedCorners();
	}
}
