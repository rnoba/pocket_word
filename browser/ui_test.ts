import * as Base from "./base.js";
import * as Input from "./input.js";

enum Ui_WidgetFlags
{
  Ui_WidgetFlag_Clickable		= (1<<0),
  Ui_WidgetFlag_ViewScroll	= (1<<1),
  Ui_WidgetFlag_DrawText		= (1<<2),
  Ui_WidgetFlag_DrawBorder	= (1<<3)
};

const Ui_DefaultWidgetPaddingPxH = 5;
const Ui_DefaultWidgetPaddingPxV = 5;

const Ui_DefaultWidgetPaddingPxH2 = Ui_DefaultWidgetPaddingPxH+Ui_DefaultWidgetPaddingPxH;
const Ui_DefaultWidgetPaddingPxV2 = Ui_DefaultWidgetPaddingPxV+Ui_DefaultWidgetPaddingPxV;

export const UI_Clickable		= Ui_WidgetFlags.Ui_WidgetFlag_Clickable;
export const UI_ViewScroll	= Ui_WidgetFlags.Ui_WidgetFlag_ViewScroll;
export const UI_DrawText		= Ui_WidgetFlags.Ui_WidgetFlag_DrawText;
export const UI_DrawBorder	= Ui_WidgetFlags.Ui_WidgetFlag_DrawBorder;

export function Ui_DrawText(
	text: string,
	color: Base.RGBA,
	x: number,
	y: number,
	font_size_px: number = 20,
	font: string = "serif")
{
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawText()` GlobalContext must be initialized");
	Base.GlobalContext!.fillStyle	= Base.RGBA_to_hex_string(color); 
	Base.GlobalContext!.font			= `${font_size_px}px ${font}`;
	Base.GlobalContext!.fillText(text, x, y);
}

function Ui_DrawRect(rect: Base.Rect, color: Base.RGBA)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawRect()` GlobalContext must be initialized");
	Base.GlobalContext!.fillStyle = Base.RGBA_to_css_string(color);
	Base.GlobalContext!.beginPath();
	Base.GlobalContext!.fillRect(
		rect.position.x,
		rect.position.y,
		rect.width,
		rect.height);
	Base.GlobalContext!.fill();
}

type WidgetId = bigint; 

interface Ui_State
{
	input: null | Input.InputInstance 
	active: WidgetId;
	hot: WidgetId;

	current_frame: number;
	dt: number;
	stack: Ui_Widget[];
}

const UiTextCenteredX		= 1 << 0;
const UiTextCenteredY		= 1 << 1;
const UiDrawText				= 1 << 2;
const UiDrawBackground	= 1 << 3;
const UiTextCentered		= UiTextCenteredX|UiTextCenteredY;

const UiState: Ui_State = {
	input: null,
	active: Base.u64(0),
	hot: Base.u64(0),
	stack: [],
	current_frame: 0,
	dt: 0
}

export function set_input_instance(input: Input.InputInstance)
{
	UiState.input = input;
}

function Ui_Push(wid: Ui_Widget)
{
	let push = true;

	for (let i = 0; i < UiState.stack.length; i++)
	{
		if (UiState.stack[i].id == wid.id)
		{
			push = false;
		}
	}

	if (push)
	{
		UiState.stack.unshift(wid);
	}
}

function Ui_PopFront()
{
	return UiState.stack.shift();
}

function Ui_PopBack()
{
	return UiState.stack.pop();
}

interface Ui_Widget
{
	id:		WidgetId;
	str:	string;
	rect: Base.Rect;
	text_rect: Base.Rect | null;
	flags: number;
}

function Ui_Widget_new(
	text: string,
	rect: Base.Rect, 
	flags: number
)
{
	let text_rect: Base.Rect | null = null;

	if (flags & UiDrawText)
	{
		text_rect = Ui_RectFromText(text);
	}

	const id: WidgetId = Base.hash_string(text);
	const widget: Ui_Widget = {
		id,
		rect,
		str: text,
		flags: flags,
		text_rect,
	}
	Ui_Push(widget);
	return (widget);
}

function Ui_RectFromText(text: string, font_size_px: number = 20, font: string = "serif")
{
	Base.assert(Base.GlobalContext !== null, "`Ui_RectFromText()` GlobalContext must be initialized");
	Base.GlobalContext!.font = `${font_size_px}px ${font}`;
	const metrics = Base.GlobalContext!.measureText(text);
	const w = metrics.actualBoundingBoxRight	+
						metrics.actualBoundingBoxLeft;
						//Ui_DefaultWidgetPaddingPxH2;
	const h = metrics.actualBoundingBoxAscent		+
						metrics.actualBoundingBoxDescent;
						//Ui_DefaultWidgetPaddingPxV2;
	return Base.Rect(
		metrics.actualBoundingBoxLeft,//	+ Ui_DefaultWidgetPaddingPxH,
		metrics.actualBoundingBoxAscent,//+ Ui_DefaultWidgetPaddingPxV,
		w, h);
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

function Ui_PointInRect(id: WidgetId): boolean
{
	Base.assert(UiState.input !== null, "Ui_State must be initialized");
	const widget = Ui_FindWidget(id);

	let result = false;
	if (widget === null)
	{
		return (result)
	}

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

function UiWidgetIsActive(id: WidgetId): boolean
{
	return (id === UiState.active);
}

function UiWidgetIsHot(id: WidgetId): boolean
{
	return (id === UiState.hot);
}

function UiWidgetSetActive(id: WidgetId)
{
	UiState.active = id;
}

function UiWidgetSetHot(id: WidgetId)
{
	if (UiState.active === Base.u64(0))
	{
		UiState.hot = id;
	}
}

export function FrameBegin(dt: number)
{
	UiState.dt = dt;
	for (const widget of UiState.stack)
	{
		if (UiWidgetIsHot(widget.id) && !Ui_PointInRect(widget.id))
		{
			UiWidgetSetHot(Base.u64(0));
		}
	}
}

export function FrameEnd()
{
	UiState.current_frame += 1;
}

function UiDrawWidget(id: WidgetId)
{
	const widget = Ui_FindWidget(id);

	Base.assert(widget !== null, "UiDrawWidget()");
	let rect = widget!.rect;
	let text_offset_x = 0;
	let text_offset_y = 0;

	if (Base.has_flag(widget!.flags, UiDrawText))
	{
		const text_rect = widget!.text_rect!;
		text_offset_x		= text_rect.position.x;
		text_offset_y		= text_rect.position.y;

		if (text_rect.width > rect.width || text_rect.height > rect.height)
		{
			rect.width	= text_rect.width;
			rect.height = text_rect.height;
		}
		else if (Base.has_flag(widget!.flags, UiTextCentered))
		{
			text_offset_x = Base.round((rect.width-text_rect.width)/2);
			text_offset_y = Base.round((rect.height+text_rect.height)/2);
		}
		else if (Base.has_flag(widget!.flags, UiTextCenteredX))
		{
			text_offset_x = Base.round((rect.width-text_rect.width)/2);
		}
		else if (Base.has_flag(widget!.flags, UiTextCenteredY))
		{
			text_offset_y = Base.round((rect.height+text_rect.height)/2);
		}
	}

	rect.height += Ui_DefaultWidgetPaddingPxH2; 
	rect.width	+= Ui_DefaultWidgetPaddingPxV2; 
	if (Base.has_flag(widget!.flags, UiDrawBackground))
	{
		Ui_DrawRect(rect, Base.RGBA_FULL_RED);
	}

	if (Base.has_flag(widget!.flags, UiDrawText))
	{
		Ui_DrawText(widget!.str, Base.RGBA(0, 0, 1),
			rect.position.x + text_offset_x + Ui_DefaultWidgetPaddingPxH,
			rect.position.y + text_offset_y + Ui_DefaultWidgetPaddingPxV);
	}
	Ui_PopFront();
}

export function Button(text: string, rect: Base.Rect): boolean
{
	let ans = false;
	const widget = Ui_Widget_new(text, rect, UiTextCentered|UiDrawText|UiDrawBackground);
	if (UiWidgetIsActive(widget.id))
	{
		if (!Ui_MButtonDown())
		{
			if (UiWidgetIsHot(widget.id))
		{
				ans = true;
			}
			UiWidgetSetActive(Base.u64(0));
		}
	}
	else if (UiWidgetIsHot(widget.id))
	{
		if (Ui_MButtonDown())
		{
			UiWidgetSetActive(widget.id);
		}
	}
	if (Ui_PointInRect(widget.id))
	{
		UiWidgetSetHot(widget.id);
	}

	UiDrawWidget(widget.id);
	return (ans);
}
