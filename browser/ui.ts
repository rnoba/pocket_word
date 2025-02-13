import * as Base	from "./base.js";
import * as Input from "./input.js";
import * as Sprite from "./sprite.js";
import * as Socket from "./socket.js";
import * as Packet from "./packet.js";
import * as Palette from "./palette.js";

export function size(kind: SizeKind, value: number, limit = 0)
{
	return {value, kind, limit} as AxisSize;
}

export function size_grow(limit = 0)
{
	return size(SizeKind.Grow, 0, limit);
}

export function size_fixed(value: number, limit = 0)
{
	return size(SizeKind.Fixed, value, limit);
}

export function size_text_content(limit = 0)
{
	return size(SizeKind.TextContent, 0, limit);
}

export function size_pct(value: number, limit = 0)
{
	return size(SizeKind.Percent, value, limit);
}

export function push_next_child_axis(axis: Axis)
{
	Base.stack_push_set_pop(ui_state.child_axis_stack, axis);
}

export function push_axis(axis: Axis)
{
	Base.stack_push(ui_state.child_axis_stack, axis);
}

export function push_next_text_alignment(alignment: UiTextAlignment)
{
	Base.stack_push_set_pop(ui_state.text_alignment_stack, alignment);
}

export function push_next_fixed_x(value: number)
{
	Base.stack_push_set_pop(ui_state.fixed_x_stack, value);
}

export function push_next_fixed_y(value: number)
{
	Base.stack_push_set_pop(ui_state.fixed_y_stack, value);
}

export function push_next_parent(parent: UiWidget)
{
	Base.stack_push_set_pop(ui_state.parent_stack, parent);
}

export function push_parent(parent: UiWidget)
{
	Base.stack_push(ui_state.parent_stack, parent);
}

export function push_next_fixed_width(width: number)
{
	Base.stack_push_set_pop(ui_state.fixed_width_stack, width);
}

export function push_next_fixed_height(height: number)
{
	Base.stack_push_set_pop(ui_state.fixed_height_stack, height);
}

export function push_next_background_color(color: Base.RGBA)
{
	Base.stack_push_set_pop(ui_state.background_color_stack, color);
}

export function push_next_width(size: AxisSize)
{
	Base.stack_push_set_pop(ui_state.width_stack, size);
}

export function push_next_height(size: AxisSize)
{
	Base.stack_push_set_pop(ui_state.height_stack, size);
}

export function push_width(size: AxisSize)
{
	Base.stack_push(ui_state.width_stack, size);
}

export function push_font(font: string)
{
	Base.stack_push(ui_state.font_stack, font);
}

export function push_font_size(sz: number)
{
	Base.stack_push(ui_state.font_size_stack, sz);
}

export function pop_font_size()
{
	Base.stack_pop(ui_state.font_size_stack);
}

export function pop_font()
{
	Base.stack_pop(ui_state.font_stack);
}

export function push_height(size: AxisSize)
{
	Base.stack_push(ui_state.height_stack, size);
}

export function push_next_bitmap(bitmap: Sprite.SpriteSource)
{
	Base.stack_push_set_pop(ui_state.bitmap_stack, bitmap);
}

export function push_bitmap(bitmap: Sprite.SpriteSource)
{
	Base.stack_push(ui_state.bitmap_stack, bitmap);
}

export function pop_bitmap()
{
	return Base.stack_pop(ui_state.bitmap_stack)?.value;
}

export function top_bitmap()
{
	return ui_state.bitmap_stack.top?.value;
}

export function push_next_bitmap_region(region: Rect)
{
	Base.stack_push_set_pop(ui_state.bitmap_region_stack, region);
}

export function pop_bitmap_region()
{
	Base.stack_pop(ui_state.bitmap_region_stack);
}

export function push_next_rounded_corners_radii(value: RoundedCornersRadius)
{
	Base.stack_push_set_pop(ui_state.rounded_corners_radii_stack, value);
}

export function push_next_border_color(value: Base.RGBA)
{
	Base.stack_push_set_pop(ui_state.border_color_stack, value);
}

export function pop_border_color()
{
	Base.stack_pop(ui_state.border_color_stack);
}

export function push_next_size(axis: 1|0, size: AxisSize)
{
	if (axis == 0)
	{
		push_next_width(size);
	}
	else
	{
		push_next_height(size);
	}
}

export function push_size(axis: 1|0, size: AxisSize)
{
	if (axis == 0)
	{
		push_width(size);
	}
	else
	{
		push_height(size);
	}
}

function pop_size(axis: 1|0)
{
	if (axis == 0)
	{
		pop_width();
	}
	else
	{
		pop_height();
	}
}

function pop_child_axis()
{
	Base.stack_pop(ui_state.child_axis_stack);
}

export function pop_parent()
{
	return Base.stack_pop(ui_state.parent_stack);
}

function pop_fixed_width()
{
	Base.stack_pop(ui_state.fixed_width_stack);
}

function pop_fixed_height()
{
	Base.stack_pop(ui_state.fixed_height_stack);
}

function pop_width()
{
	Base.stack_pop(ui_state.width_stack);
}

function pop_height()
{
	Base.stack_pop(ui_state.height_stack);
}

function pop_fixed_x()
{
	Base.stack_pop(ui_state.fixed_x_stack);
}

function pop_fixed_y()
{
	Base.stack_pop(ui_state.fixed_y_stack);
}

function pop_text_alignment()
{
	Base.stack_pop(ui_state.text_alignment_stack);
}

function pop_background_color()
{
	Base.stack_pop(ui_state.background_color_stack);
}

export function pop_rounded_corners_radii()
{
	Base.stack_pop(ui_state.rounded_corners_radii_stack);
}

export function pop_palette()
{
	Base.stack_pop(ui_state.palette_stack);
}

export function push_next_palette(palette: Palette.Palette)
{
	Base.stack_push_set_pop(ui_state.palette_stack, palette);
}

export function push_palette(palette: Palette.Palette)
{
	Base.stack_push(ui_state.palette_stack, palette);
}

function pop_stacks()
{
	if (ui_state.parent_stack.pop) pop_parent();
	if (ui_state.rounded_corners_radii_stack.pop) pop_rounded_corners_radii(); 
	if (ui_state.child_axis_stack.pop) pop_child_axis();
	if (ui_state.fixed_width_stack.pop) pop_fixed_width();
	if (ui_state.fixed_height_stack.pop) pop_fixed_height();
	if (ui_state.fixed_x_stack.pop) pop_fixed_x();
	if (ui_state.fixed_y_stack.pop) pop_fixed_y();
	if (ui_state.text_alignment_stack.pop) pop_text_alignment();
	if (ui_state.width_stack.pop) pop_width();
	if (ui_state.height_stack.pop) pop_height();
	if (ui_state.background_color_stack.pop) pop_background_color();
	if (ui_state.bitmap_region_stack.pop) pop_bitmap_region();
	if (ui_state.bitmap_stack.pop) pop_bitmap();
	if (ui_state.palette_stack.pop) pop_palette(); 
	if (ui_state.font_stack.pop) pop_font(); 
	if (ui_state.font_size_stack.pop) pop_font_size(); 
	if (ui_state.border_color_stack.pop) pop_border_color(); 
}

export enum UiTextAlignment {
	Left,
	Center,
	Right
}

function ui_measure_text(text: string, font_size: number = Ui_DefaultTextSize, font: string = Ui_DefaultFont)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_RectFromText()` GlobalContext must be initialized");
	Base.GlobalContext!.font = `${font_size}px ${font}`;

	Base.GlobalContext!.textBaseline = "middle"
	const metrics = Base.GlobalContext!.measureText(text);
	const w = metrics.actualBoundingBoxRight	+
						metrics.actualBoundingBoxLeft;
	const h = metrics.actualBoundingBoxAscent		+
						metrics.actualBoundingBoxDescent;
	return Base.Rect(
		metrics.actualBoundingBoxLeft,
		metrics.actualBoundingBoxAscent,
		Base.Round(w), Base.Round(h));
}

const Ui_DefaultTextSize		= 16;
const Ui_DefaultFont				= "Arial";

export const UiDrawText					= 1 << 2;
export const UiDrawBackground		= 1 << 3;
export const UiDrawBorder				= 1 << 4;
export const UiClickable				= 1 << 5;
export const UiResizeToContent	= 1 << 9;
export const UiScroll						= 1 << 10;
export const UiScrollViewX			= 1 << 11;
export const UiScrollViewY			= 1 << 12;
export const UiScrollView				= UiScrollViewX|UiScrollViewY;
export const UiViewClampX			  = 1 << 13;
export const UiViewClampY			  = 1 << 14;
export const UiViewClamp			  = UiViewClampX|UiViewClampY; 
export const UiFixedWidth  = 1 << 16;
export const UiFixedHeight = 1 << 17;
export const UiAllowOverflowX  = 1 << 18;
export const UiAllowOverflowY  = 1 << 19;
export const UiAllowOverflow   = UiAllowOverflowX|UiAllowOverflowY;
export const UiFloatingX = 1 << 20;
export const UiFloatingY = 1 << 21;
export const UiFloating  = UiFloatingX|UiFloatingY; 
export const UiRectClip = 1 << 22;
export const UiDrawBitmap	= 1 << 23;
export const UiBitmapCenteredX	= 1 << 24;
export const UiBitmapCenteredY	= 1 << 25;
export const UiBitmapCentered		= UiBitmapCenteredX|UiBitmapCenteredY; 

export function ui_draw_text(
	text: string,
	color: Base.RGBA,
	x: number,
	y: number,
	font_size: number = Ui_DefaultTextSize,
	font: string = Ui_DefaultFont)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawText()` GlobalContext must be initialized");
	Base.GlobalContext!.fillStyle	= Base.RGBA_to_hex_string(color); 
	Base.GlobalContext!.font			= `${font_size}px ${font}`;
	Base.GlobalContext!.fillText(text, x, y);
}

export function ui_cursor()
{
	return (Input.cursor());
}

export function ui_reset_drag_delta()
{
	ui_state.drag_start.set(ui_cursor().position);
}

export function ui_drag_delta()
{
	return (ui_cursor().position
					.clone()
					.sub(ui_state.drag_start));
}

function ui_is_lmouse_down(): boolean
{
	return (Input.is_down(Input.MBttn.M_LEFT));
}

export function ui_init(socket: WebSocket)
{
	Socket.add_connection_hook(() => {
		const packet = Packet.packet_request_sprite_info_make();
		Socket.send_packet(socket, packet);
	});

	Socket.add_listener(Packet.PacketKind.PacketKind_SpriteInfo, (packet) => {
		const payload = packet.payload as Packet.PacketSpriteInfo;

		const sprite = Sprite.Sprite_new(
			Base.Rect(payload.offset_x, payload.offset_y, payload.width, payload.height),
			payload.source_file,
			0, 0,
			payload.id,
			payload.descrition,
			payload.name,
			payload.created_at
		);
		//sprite_loader_state.sprites_from_server.push(sprite);
	});
}

export enum SizeKind {
	None,
	Fixed,
	Percent,
	TextContent,
	Grow,
};

export type Axis = 0 | 1; 

export const AxisX = 0;
export const AxisY = 1;

export type AxisSize = {
	value: number;
	kind:  SizeKind;
	limit: number;
};

type Size = {
	v: Base.Pair<AxisSize>;
};

interface UiState
{
	state: UiWidget[];
	focused:	WidgetId;
	active:		WidgetId;
	hot:			WidgetId;

	drag_start: Base.V2;
	is_dragging: boolean; 
	current_frame: number;
	delta_time: number;
	socket: WebSocket | null;

	free_widget:	 Base.Stack<UiWidget>;	
	child_axis_stack:		Base.Stack<Axis>;
	parent_stack:				Base.Stack<UiWidget>;
	height_stack:				Base.Stack<AxisSize>;
	width_stack:				Base.Stack<AxisSize>;
	fixed_width_stack:	Base.Stack<number>;
	fixed_height_stack:	Base.Stack<number>;
	fixed_x_stack:			Base.Stack<number>;
	fixed_y_stack:			Base.Stack<number>;
	palette_stack:			Base.Stack<Palette.Palette>;
	font_stack:			Base.Stack<string>;
	font_size_stack:			Base.Stack<number>;
	rounded_corners_radii_stack:	Base.Stack<RoundedCornersRadius>;
	bitmap_stack:				Base.Stack<ImageBitmap>;
	bitmap_region_stack:	Base.Stack<Rect>;
	background_color_stack:		Base.Stack<Base.RGBA>;
	border_color_stack:		Base.Stack<Base.RGBA>;
	text_alignment_stack:	Base.Stack<UiTextAlignment>;
	key_press_history: Map<Input.Key, {id: WidgetId, frame: number}>;
	root:								UiWidget | null;
}

export const ui_state: UiState = {
	root: null,
	state: [],
	focused: Base.u640,
	active: Base.u640,
	hot: Base.u640,
	drag_start: Base.V2.Zero(),
	is_dragging: false, 
	current_frame: 0,
	delta_time: 0,
	socket: null,
	background_color_stack: Base.stack_init(Base.RGBA_FULL_WHITE),		
	border_color_stack: Base.stack_init(Base.RGBA_FULL_WHITE),		
	child_axis_stack:		Base.stack_empty(),	
	free_widget:				Base.stack_empty(),
	parent_stack:				Base.stack_empty(),
	fixed_width_stack:	Base.stack_empty(),
	fixed_height_stack:	Base.stack_empty(),
	bitmap_stack:				Base.stack_empty(),
	bitmap_region_stack:Base.stack_empty(),
	palette_stack:			Base.stack_empty(),
	font_stack:					Base.stack_init("Repo"),
	font_size_stack:		Base.stack_init(15),
	rounded_corners_radii_stack: Base.stack_init(rouded_corners(0, 0, 0, 0)),
	height_stack:				Base.stack_init(size_grow()),
	width_stack:				Base.stack_init(size_grow()),
	fixed_x_stack:			Base.stack_empty(),
	fixed_y_stack:			Base.stack_empty(),
	text_alignment_stack: Base.stack_init(UiTextAlignment.Center),
	key_press_history: new Map()
}

export interface Rect {
	pos:	Base.Pair<number>,
	size: Base.Pair<number>,
}


export function ui_rect(x: number, y: number, w: number, h: number): Rect
{
	return {pos: [x, y], size: [w, h]}
}

type WidgetId = number; 
interface UiWidget
{
	id:		WidgetId;
	rect: Rect;
	text:	string;
	flags: number;
	rounded_corners_radii: RoundedCornersRadius;
	border_size: number;
	background_color: Base.RGBA;
	active_color: Base.RGBA;
	hot_color:		Base.RGBA;
	border_color: Base.RGBA;
	text_color:		Base.RGBA;

	font_size: number;
	font: string;

	bitmap_data:	ImageBitmap | null;
	bitmap_region: Rect | null;
	clipped_rect: Rect | null;

	view_offset: Base.Pair<number, number>; 

	position_delta: Base.Pair<number>;
	last_rendered_frame: number;
	text_metrics:		Base.Rect;
	text_alignment: UiTextAlignment;

	parent:						UiWidget | null;
	first:						UiWidget | null;
	last:							UiWidget | null;
	next:							UiWidget | null;
	prev:							UiWidget | null;

	layout_axis:			Axis;
	text_padding:			number;
	fixed_size:				Base.Pair<number>;
	fixed_position:	  Base.Pair<number>;
	view_bounds:			Base.Pair<number>;
	size:							Size;
}

export function rouded_corners(top_left: number, top_right: number, bottom_left: number, bottom_right: number): RoundedCornersRadius
{
	return {
		TopRight: top_right,
		TopLeft: top_left,
		BottomLeft: bottom_left,
		BottomRight: bottom_right
	}
}

function ui_widget_empty(): UiWidget
{
	return {
		id: Base.u640,
		text: "",
		rect: {pos: [0, 0], size: [0, 0]},
		flags: 0,
		border_size: 0,

		font_size: 16,
		font: Ui_DefaultFont,
		rounded_corners_radii: rouded_corners(0, 0, 0, 0),
		background_color: Base.RGBA_FULL_WHITE,
		active_color: Base.RGBA_FULL_BLACK,
		hot_color: Base.RGBA_FULL_BLACK,
		border_color: Base.RGBA_FULL_WHITE,
		text_color: Base.RGBA_FULL_WHITE,
		bitmap_data: null,
		bitmap_region: null,
		text_padding: 1, 
		view_offset: [0, 0], 
		text_metrics: Base.Rect(0, 0, 0, 0),
		clipped_rect: null,
		last_rendered_frame: 0,
		parent: null,
		first: null,
		last: null,
		next: null,
		prev: null,
		layout_axis: 0,
		fixed_size: [0, 0],
		fixed_position: [0, 0],
		position_delta: [0, 0],
		view_bounds: [0, 0],
		text_alignment: 0,
		size: {v: [size(SizeKind.None, 0), size(SizeKind.None, 0)]},
	};
}

function ui_add_widget(widget: UiWidget)
{
	let i = 0;
	for (i = 0; !!ui_state.state[i]; i += 1) {}
	if (i < ui_state.state.length) { ui_state.state[i] = widget; }
	else { ui_state.state.push(widget); }
}

function ui_find_widget(id: WidgetId): UiWidget | null
{
	let ret = null;

	if (id !== Base.u640)
	{
		for (let i = 0; i < ui_state.state.length; i++)
		{
			if (ui_state.state[i] && ui_state.state[i].id === id)
			{
				ret = ui_state.state[i];
				break;
			}
		}
	}
	return (ret);
}

export function ui_frame_end()
{
	if (ui_state.active !== Base.u640)
	{
		const widget = ui_find_widget(ui_state.active);
		if (widget) { ui_state.is_dragging = true; }
	}

	for (let i = 0; i < ui_state.state.length; i += 1)
	{
		const wid = ui_state.state[i];
		if (!wid) { continue; }

		if (wid.last_rendered_frame < ui_state.current_frame ||
				wid.id === Base.u640)
		{
			delete ui_state.state[i];
			wid.fixed_position[0] = 0;
			wid.fixed_position[1] = 0;
			wid.fixed_size[0]			= 0;
			wid.fixed_size[1]			= 0;
			wid.view_offset[0]		= 0;
			wid.view_offset[1]		= 0;
			wid.layout_axis = AxisX;
			wid.clipped_rect = null;
			Base.stack_push(ui_state.free_widget, wid);
		}
	}

	ui_calc_layout(ui_state.root!, AxisX);
	ui_calc_layout(ui_state.root!, AxisY);
	ui_calc_test(ui_state.root!);

	ui_draw();
	pop_parent();
	Input.consume_event();
	ui_state.current_frame += 1;
}

export function ui_frame_begin(dt: number, width: number = 800, height: number = 600)
{
	ui_state.root = null;
	ui_state.delta_time = dt;

	push_next_fixed_x(0);
	push_next_fixed_y(0);
	push_next_child_axis(AxisX);
	push_next_fixed_width(width);
	push_next_fixed_height(height);
	push_next_background_color(Base.RGBA_FULL_TRANSPARENT);
	const root = widget_make("--root", UiDrawBackground); 
	push_parent(root);
	ui_state.root = root;

	if (ui_state.active === Base.u640)
	{
		ui_state.hot = ui_state.active;
		ui_state.is_dragging = false;
	}
}

function ui_calc_fixed_size_rec(root: UiWidget, axis: Axis)
{
	switch (root.size.v[axis].kind)
	{
    case SizeKind.Fixed:
    {
      root.fixed_size[axis] = root.size.v[axis].value;
    } break;
    case SizeKind.TextContent:
    {
      const padding		= root.size.v[axis].value;
      const text_size = axis === AxisX ? root.text_metrics.width : root.text_metrics.height;
      root.fixed_size[axis] = padding + text_size + root.text_padding * 2;
    } break;
    default:
			break;
	}

  for (let child = root.first; child !== null; child = child.next)
  {
		ui_calc_fixed_size_rec(child, axis);
  }
  
}

function ui_calc_percent_size_rec(root: UiWidget, axis: Axis)
{
  switch (root.size.v[axis].kind)
  {
    case SizeKind.Percent:
    {
			let fixed_parent: UiWidget | null = null; 
      for (let p = root.parent; p !== null; p = p.parent)
      {
        if(Base.has_flag(p.flags, (UiFixedWidth << axis))	||
           p.size.v[axis].kind === SizeKind.Fixed								||
           p.size.v[axis].kind === SizeKind.TextContent					||
           p.size.v[axis].kind === SizeKind.Percent)
        {
          fixed_parent = p;
          break;
        }
      }
      const size = fixed_parent!.fixed_size[axis] * root.size.v[axis].value;
      root.fixed_size[axis] = size;
    } break;
    default:
			break;
  }

  for (let child = root.first; child !== null; child = child.next)
  {
		ui_calc_percent_size_rec(child, axis);
  }
}

function ui_calc_grow_size_rec(root: UiWidget, axis: Axis)
{
  for(let child = root.first; child !== null; child = child.next)
  {
		ui_calc_grow_size_rec(child, axis);
  }

  switch (root.size.v[axis].kind)
  {
    
    case SizeKind.Grow:
    {
      let sum = 0;
			for (let child = root.first; child !== null; child = child.next)
      {
				if(!Base.has_flag(child.flags, (UiFloatingX << axis)))
				{
					if (axis === root.layout_axis)
					{
						sum += child.fixed_size[axis];
					}
					else
					{
						sum = Math.max(sum, child.fixed_size[axis]);
					}
				}
      }
      root.fixed_size[axis] = sum;
    } break;
    default:
			break;
  }
}

function ui_calc_size_clipping(root: UiWidget, axis: Axis)
{
  if (axis !== root.layout_axis && !Base.has_flag(root.flags, (UiAllowOverflowX << axis)))
  {
		const parent_size = root.fixed_size[axis];
    for(let child = root.first; child !== null; child = child.next)
    {
			if (!Base.has_flag(child.flags, (UiFloatingX << axis)))
			{
				const child_size	= child.fixed_size[axis];
				const fix					= child_size - parent_size;
				const fixup				= Base.Clamp(fix, 0, child_size);
				if (fixup > 0) { child.fixed_size[axis] -= fixup; }
			}
    }
    
  }
  
  if (axis === root.layout_axis && !Base.has_flag(root.flags, (UiAllowOverflowX << axis)))
  {
    const root_size = root.fixed_size[axis];
    let		total_size = 0;
    let		total_limited_size = 0;
    for (let child = root.first; child !== null; child = child.next)
    {
			if (!Base.has_flag(child.flags, (UiFloatingX << axis)))
			{
				total_size += child.fixed_size[axis];
				total_limited_size += child.fixed_size[axis] * (1-child.size.v[axis].limit);
      }
    }
    const fix = total_size - root_size;
    if (fix > 0)
    {
      const child_fixups: number[] = [];
      let		child_fixup_sum = 0;
			let child_idx = 0;
			for (let child = root.first; child !== null; child = child.next, child_idx += 1)
			{
				if (!Base.has_flag(child.flags, (UiFloatingX << axis)))
				{
					let child_fixup_size			= child.fixed_size[axis] * (1-child.size.v[axis].limit);
					child_fixup_size					= Math.max(0, child_fixup_size);
					child_fixups[child_idx]		= child_fixup_size;
					child_fixup_sum						+= child_fixup_size;
				}
			}
			child_idx = 0;
			for (let child = root.first; child !== null; child = child.next, child_idx += 1)
			{
				if (!Base.has_flag(child.flags, (UiFloatingX << axis)))
				{
					let fixup_pct = Base.Clamp(fix / total_limited_size, 0, 1);
					child.fixed_size[axis] -= child_fixups[child_idx] * fixup_pct;
				}
			}
    }
  }
  
  if (Base.has_flag(root.flags, (UiAllowOverflowX << axis)))
  {
    for (let child = root.first; child !== null; child = child.next)
    {
      if (child.size.v[axis].kind === SizeKind.Percent)
      {
        child.fixed_size[axis] = root.fixed_size[axis] * child.size.v[axis].value;
      }
    }
  }
  
  for (let child = root.first; child !== null; child = child.next)
  {
		ui_calc_size_clipping(child, axis);
  }
}

function ui_calc_pos_clipping(root: UiWidget, axis: Axis)
{
  let bounds = 0;
  let layout_position = 0;
  for (let child = root.first; child !== null; child = child.next)
  {
    let original_position = child.rect.pos[axis];
		if (!Base.has_flag(child.flags, (UiFloatingX << axis)))
		{
      child.fixed_position[axis] = layout_position;
      if (root.layout_axis === axis)
      {
        layout_position += child.fixed_size[axis];
        bounds					+= child.fixed_size[axis];
      }
      else
      {
        bounds = Math.max(bounds, child.fixed_size[axis]);
      }
    }
		child.rect.pos[axis]	= Base.Floor(root.rect.pos[axis] + child.fixed_position[axis] + Base.Floor(-root.view_offset[axis]));
		//if (axis === AxisX) child.rect.pos[axis] += child.border_size;
		//if (axis === AxisY) child.rect.pos[axis] -= child.border_size;
    child.rect.size[axis] = Base.Floor(child.fixed_size[axis]);

		const new_position = child.rect.pos[axis];
    child.position_delta[axis] = new_position - original_position;
  }

	root.rect.pos[0]	= Base.Floor(root.rect.pos[0]);
	root.rect.pos[1]	= Base.Floor(root.rect.pos[1]);
	root.rect.size[0] = Base.Floor(root.fixed_size[0]);
	root.rect.size[1] = Base.Floor(root.fixed_size[1]);
	root.view_bounds[axis] = bounds;

  for (let child = root.first; child !== null; child = child.next)
  {
		ui_calc_pos_clipping(child, axis);
  }
}

function ui_calc_test(root: UiWidget)
{
	if (Base.has_flag(root.flags, UiRectClip))
	{
		let clip_against = root.rect;
		if (root.clipped_rect) { clip_against = root.clipped_rect; }
		for (let child = root.first; child !== null; child = child.next)
		{
			child.clipped_rect = null;
			const clip = Base.rect_clip(child.rect, clip_against);

			if (clip.size[0]	!== child.rect.size[0]	|| 
					clip.size[1]	!== child.rect.size[1]	|| 
					clip.pos[0]		!== child.rect.pos[0]		|| 
					clip.pos[1]		!== child.rect.pos[1])
			{
				child.clipped_rect = clip;
			}
		}
	}

  for (let child = root.first; child !== null; child = child.next)
  {
			ui_calc_test(child);
  }

}

function ui_calc_layout(root: UiWidget, axis: Axis)
{
	ui_calc_fixed_size_rec(root, axis);
	ui_calc_percent_size_rec(root, axis);
	ui_calc_grow_size_rec(root, axis);
	ui_calc_size_clipping(root, axis);
	ui_calc_pos_clipping(root, axis);
}


//function ui_rouded_corners(
//	ctx: CanvasRenderingContext2D,
//	x: number, y: number,
//	w: number, h: number, radius: number)
//{
//	ctx.beginPath();
//		ctx.moveTo(x + radius, y);
//		ctx.lineTo(x + w - radius, y);
//		ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
//		ctx.lineTo(x + w, y + h - radius);
//		ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
//		ctx.lineTo(x + radius, y + h);
//		ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
//		ctx.lineTo(x, y + radius);
//		ctx.quadraticCurveTo(x, y, x + radius, y);
//	ctx.closePath();
//}

export type RoundedCornersRadius = {
	TopLeft: number;
	TopRight: number;
	BottomRight: number;
	BottomLeft: number;
};

function ui_rounded_corners(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	radii: RoundedCornersRadius
) {
	let tl = Math.min(radii.TopLeft, w / 2, h / 2);
	let tr = Math.min(radii.TopRight, w / 2, h / 2);
	let br = Math.min(radii.BottomRight, w / 2, h / 2);
	let bl = Math.min(radii.BottomLeft, w / 2, h / 2);

	if (tl + tr > w) {
		const scale = w / (tl + tr);
		tl *= scale;
		tr *= scale;
	}
	if (bl + br > w) {
		const scale = w / (bl + br);
		bl *= scale;
		br *= scale;
	}

	if (tl + bl > h) {
		const scale = h / (tl + bl);
		tl *= scale;
		bl *= scale;
	}
	if (tr + br > h) {
		const scale = h / (tr + br);
		tr *= scale;
		br *= scale;
	}
	ctx.beginPath();
		ctx.moveTo(x + tl, y);
		ctx.lineTo(x + w - tr, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
		ctx.lineTo(x + w, y + h - br);
		ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
		ctx.lineTo(x + bl, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
		ctx.lineTo(x, y + tl);
		ctx.quadraticCurveTo(x, y, x + tl, y);
	ctx.closePath();
}

function ui_draw_rect(
	x: number, y: number,
	w: number, h: number,
	radius: RoundedCornersRadius,
	color: string,
	border_color: string,
	fill: boolean = true,
	stroke: boolean = false,
	size: number = 2)
{
	Base.assert(Base.GlobalContext !== null, "`Ui_DrawRoundedRectagle()` GlobalContext must be initialized");
	const ctx = Base.GlobalContext!; 

	ctx.save();
		ctx.strokeStyle = border_color;
		ctx.fillStyle	= color;
		ctx.lineWidth = size;

		ui_rounded_corners(ctx, x, y, w, h, radius);
		if (stroke) { ctx.stroke(); }
		if (fill) { ctx.fill(); }        
		ctx.clip();
	ctx.restore();
}

function ui_draw_image(
    image: ImageBitmap,
    img_region: Rect,
    src_region: Rect,
		radius: RoundedCornersRadius,
		clip_rect: Rect | null = null
) {
    Base.assert(Base.GlobalContext !== null, "`Ui_DrawRoundedRectangle()` GlobalContext must be initialized");
    const ctx = Base.GlobalContext!;

    let x = src_region.pos[0];
    let y = src_region.pos[1];
    let w = src_region.size[0];
    let h = src_region.size[1];

		let dx = img_region.pos[0];
		let dy = img_region.pos[1];
		let dw = img_region.size[0];
		let dh = img_region.size[1];

		if (clip_rect)
		{

			const cx = src_region.pos[0]-clip_rect.pos[0];
			const cy = src_region.pos[1]-clip_rect.pos[1];
			const cw = src_region.size[0]-clip_rect.size[0];
			const ch = src_region.size[1]-clip_rect.size[1];

			x = clip_rect.pos[0];
			y = clip_rect.pos[1];
			w = clip_rect.size[0];
			h = clip_rect.size[1];

			dx -= cx;
			dy -= cy;
			dw -= cw;
			dh -= ch;
		}

    ctx.save();
			ui_rounded_corners(ctx, x, y, w, h, radius);
			ctx.clip();
			ctx.drawImage(image,
										dx, dy, dw, dh,
										x, y, w, h);
    ctx.restore();
}

export function ui_widget_draw(widget: UiWidget)
{

	const color = Base.RGBA_to_css_string(widget.background_color);
	const border_color = Base.RGBA_to_css_string(widget.border_color);

	let x = widget.rect.pos[0];
	let y = widget.rect.pos[1];
	let w = widget.rect.size[0];
	let h = widget.rect.size[1];

	if (widget.clipped_rect !== null)
	{
		x = widget.clipped_rect.pos[0];
		y = widget.clipped_rect.pos[1];
		w = widget.clipped_rect.size[0];
		h = widget.clipped_rect.size[1];
	}

	ui_draw_rect(x, y, w, h,
							 widget.rounded_corners_radii,
							 color, border_color,
							 Base.has_flag(widget.flags, UiDrawBackground),
							 Base.has_flag(widget.flags, UiDrawBorder),
							 widget.border_size);

	if (Base.has_flag(widget.flags, UiDrawText))
	{
		let text_pos = widget.text_metrics.position;
		text_pos.y += Base.Floor((y + h / 2) - (widget.text_metrics.height / 2));
		switch (widget.text_alignment)
		{
			case UiTextAlignment.Center:
			{
				text_pos.x = Base.Floor(x + w / 2) - ((text_pos.x + widget.text_metrics.width) / 2);
				text_pos.x = Math.max(text_pos.x, x);
			} break;
			case UiTextAlignment.Left:
			{
				text_pos.x += x + widget.text_padding;
			} break;
			case UiTextAlignment.Right:
			{
				text_pos.x += Base.Floor(w - widget.text_metrics.width - widget.text_padding);
				text_pos.x = Math.max(text_pos.x, x);
			} break;
			default:
				break;
		}
		ui_draw_text(widget.text,
								 widget.text_color,
								 text_pos.x,
								 text_pos.y,
								 widget.font_size,
								 widget.font);
	}

	if (widget.bitmap_data && Base.has_flag(widget.flags, UiDrawBitmap))
	{
		const bitmap = widget.bitmap_data!;
		const region = widget.bitmap_region;
		ui_draw_image(bitmap,
									region ? region : widget.rect,
									/*widget.clipped_rect ? widget.clipped_rect : */widget.rect,
									widget.rounded_corners_radii,
									widget.clipped_rect);
	}
}


export function ui_draw()
{
	for (let i = 0; i < ui_state.state.length; i += 1)
	{
		if (ui_state.state[i])
		{
			ui_widget_draw(ui_state.state[i]);
		}
	}
}

export function widget_make(text: string = "", flags: number): UiWidget
{
	let hash_part = text;
	if (text.includes("#"))
	{
		const split = text.split("#");
		hash_part		= split[0];
		text				= split[1];
	}
	const id	 = Base.hash_string(hash_part);

	let widget = ui_find_widget(id);

	const parent = ui_state.parent_stack.top?.value || null;
	const create = widget === null;
	if (create)
	{
		widget = ui_state.free_widget.top?.value || null;
		if (widget) { Base.stack_pop(ui_state.free_widget); }
		else { widget = ui_widget_empty(); }
	}

	widget!.first		= widget!.last = widget!.next = widget!.prev = widget!.parent = null;
	widget!.flags		= 0;
	widget!.size.v[AxisX] = size(SizeKind.None, 0);
	widget!.size.v[AxisY] = size(SizeKind.None, 0);

	if (create && id !== Base.u640)
	{
		ui_add_widget(widget!);
	}

	if (parent)
	{
    Base.dll_insert_back<UiWidget>(parent, widget!);
		widget!.parent = parent;
	}
	widget!.id		= id;
	widget!.text	= text;
	widget!.flags	|= flags;
	if (ui_state.child_axis_stack.top) { widget!.layout_axis = ui_state.child_axis_stack.top!.value; }

	if (ui_state.fixed_width_stack.top !== null)
	{
		widget!.fixed_size[0] = ui_state.fixed_width_stack.top!.value;
		widget!.flags |= UiFixedWidth;
	}
	else
	{
		widget!.size.v[0] = ui_state.width_stack.top!.value;

	}

	if (ui_state.fixed_height_stack.top !== null)
	{
		widget!.fixed_size[1] = ui_state.fixed_height_stack.top!.value;
		widget!.flags |= UiFixedHeight;
	}
	else
	{
		widget!.size.v[1] = ui_state.height_stack.top!.value;
	}

	if(ui_state.fixed_x_stack.top !== null)
	{
		widget!.flags |= UiFloatingX;
		widget!.fixed_position[0] = ui_state.fixed_x_stack.top!.value;
	}
	if(ui_state.fixed_y_stack.top !== null)
	{
		widget!.flags |= UiFloatingY;
		widget!.fixed_position[1] = ui_state.fixed_y_stack.top!.value;
	}
	if (ui_state.bitmap_stack.top !== null)
	{
		//widget!.flags |= UiDrawBitmap;
		widget!.bitmap_data		= ui_state.bitmap_stack.top!.value;
		widget!.bitmap_region = ui_state.bitmap_region_stack.top?.value || null;
	}
	widget!.text_alignment				= ui_state.text_alignment_stack.top!.value;
	widget!.font									= ui_state.font_stack.top!.value;
	widget!.font_size							= ui_state.font_size_stack.top!.value;
	widget!.rounded_corners_radii = ui_state.rounded_corners_radii_stack.top!.value;
	widget!.border_color					= ui_state.border_color_stack.top!.value;
	widget!.background_color			= ui_state.background_color_stack.top!.value;
	widget!.last_rendered_frame		= ui_state.current_frame;
	if (ui_state.palette_stack.top !== null)
	{
		const {
			border_color,
			background_color,
			border_size,
			rouded_corners,
			font,
			font_size,
			text_color
		} = ui_state.palette_stack.top.value!;

		widget!.border_color = border_color;
		widget!.background_color = background_color;
		widget!.border_size = border_size;
		widget!.rounded_corners_radii = rouded_corners;
		widget!.font = font;
		widget!.font_size = font_size;
		widget!.text_color = text_color;
	}
	if (Base.has_flag(widget!.flags, UiDrawText))
	{
		widget!.text_metrics = ui_measure_text(widget!.text, widget!.font_size, widget!.font);
	}
	pop_stacks();
	return (widget!);
}

export interface WidgetInteracion
{
	widget: UiWidget;
	clicked: boolean;
	dragging: boolean;
	hovering: boolean;
	double_clicked: boolean;
	scroll_x: number;
	scroll_y: number;
}

function ui_cursor_in_rect(rect: Rect)
{
	let result = false;

	const c = ui_cursor().position;
	if (Base.point_in_rect_ui(c.x, c.y, rect)) 
	{
		result = true;
	}
	return (result);
}

export function widget_with_interaction(widget: UiWidget)
{
	const interaction: WidgetInteracion = {
		widget,
		clicked: false,
		dragging: false,
		double_clicked: false,
		hovering: false,
		scroll_x: 0,
		scroll_y: 0,
	}

	const rect = widget.clipped_rect ? widget.clipped_rect : widget.rect;
	const cursor_in_rect = ui_cursor_in_rect(rect);

	if (Base.has_flag(widget.flags, UiClickable)	&&
			cursor_in_rect														&&
			ui_is_lmouse_down()												&&
		 !ui_state.is_dragging)
	{
		ui_state.hot		 = widget.id;
		ui_state.active  = widget.id;
		ui_state.focused = widget.id;
		ui_state.drag_start.set(ui_cursor().position);

		const history = ui_state.key_press_history.get(Input.MBttn.M_LEFT);
		if (history && (history.id === widget.id &&
										ui_state.current_frame-history.frame < 10))
		{
			interaction.double_clicked	= true;
			history.id = Base.u640;
		}
	}

	if (Base.has_flag(widget.flags, UiClickable)	&&
			cursor_in_rect														&&
			!ui_is_lmouse_down()											&&
			ui_state.active === widget.id)
	{
		ui_state.active = Base.u640; 
		ui_state.key_press_history.set(
			Input.MBttn.M_LEFT,
			{ id: widget.id, frame: ui_state.current_frame});
		interaction.clicked = true;
		ui_state.is_dragging = false;
	}

	if (Base.has_flag(widget.flags, UiClickable)	&&
		 !cursor_in_rect														&&
		 !ui_is_lmouse_down()												&&
		 ui_state.active === widget.id)
	{
		ui_state.active = Base.u640; 
		ui_state.hot = Base.u640; 
	}

	if (Base.has_flag(widget.flags, UiClickable)	&&
		 !cursor_in_rect														&&
		 ui_is_lmouse_down()												&&
		 ui_state.focused === widget.id)
	{
		ui_state.focused = Base.u640; 
	}

	if(Base.has_flag(widget.flags, UiClickable) &&
		cursor_in_rect														&&
		(ui_state.active === Base.u640 || ui_state.active === widget.id))
	{
		ui_state.hot = widget.id; 
		interaction.hovering = true;
	}

	let evt = Input.next_event_of<Input.WheelEvent>(Input.IptEventKind.Wheel);
	if (evt)
	{
		if (Base.has_flag(widget.flags, UiScroll) &&
				cursor_in_rect)
		{

			let { deltaX: dx, deltaY: dy } = evt.payload;
			if (Input.is_down(Input.KKey.KEY_LShift))
			{
				let tmp = dx;
				dx = dy;
				dy = tmp;
			}
			interaction.scroll_x += dx;
			interaction.scroll_y += dy;
			Input.consume_event();
		}

		let scrolled = false;
		if (Base.has_flag(widget.flags, UiScrollView) &&
				cursor_in_rect && !Input.is_down(Input.KKey.KEY_S))
		{

				let { deltaX: dx, deltaY: dy } = evt.payload;
				if (Input.is_down(Input.KKey.KEY_LShift))
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
				widget.view_offset[0] += dx * ui_state.delta_time * 10;
				widget.view_offset[1] += dy * ui_state.delta_time * 10;
				Input.consume_event();
				scrolled = true;
			}

		if (scrolled && Base.has_flag(widget.flags, UiViewClamp))
		{
			const max_view_x = Math.max(0, widget.view_bounds[0] - widget.fixed_size[0]);
			const max_view_y = Math.max(0, widget.view_bounds[1] - widget.fixed_size[1]);

			if(Base.has_flag(widget.flags, UiViewClampX))
			{
				widget.view_offset[0] = Base.Clamp(widget.view_offset[0], 0, max_view_x);
			}
			if(Base.has_flag(widget.flags, UiViewClampY))
			{
				widget.view_offset[1] = Base.Clamp(widget.view_offset[1], 0, max_view_y);
			}
		}
	}
	interaction.dragging = (ui_state.is_dragging && widget.id === ui_state.active);
	return (interaction);
}

export function Container(text: string, flags: number = 0)
{
	const wid = widget_make(text, UiDrawBackground|flags);
	return widget_with_interaction(wid);
}

export function Button(text: string, flags: number)
{
	push_next_text_alignment(UiTextAlignment.Center);
	const wid = widget_make(text, flags|UiClickable|UiDrawBorder|UiDrawBackground|UiDrawText);
	return widget_with_interaction(wid);
}

export function row_begin(flags: number = 0)
{
	push_next_child_axis(AxisX);
	const wid = widget_make("", flags);
	push_parent(wid);
}

export function row_end()
{
	const wid = pop_parent();
	return widget_with_interaction(wid!.value);
}

export function column_begin(flags: number = 0)
{
	push_next_child_axis(AxisY);
	const wid = widget_make("", flags);
	push_parent(wid);
}

export function column_end()
{
	const wid = pop_parent();
	return widget_with_interaction(wid!.value);
}

export function spacer(size: AxisSize)
{
	const parent = ui_state.parent_stack.top!.value;
	push_next_size(parent.layout_axis, size);

	const wid = widget_make("", 0); 
	return widget_with_interaction(wid);
}

export enum UiAttachPos {
	TopLeft,
	BottomLeft,
	TopRight,
	BottomRight,
	Center
}

export function attach_begin(where: UiAttachPos)
{
	push_next_size(AxisX, size_pct(1));
	push_next_size(AxisY, size_pct(1));

	const parent = widget_make("", UiFloating); 
	push_parent(parent);
	switch (where)
	{
		case UiAttachPos.TopRight: {
			column_begin();
			row_begin();
			spacer(size_pct(1));
		} break;
		case UiAttachPos.BottomLeft: {
			column_begin();
			spacer(size_pct(1));
			row_begin();
		} break;
		case UiAttachPos.BottomRight: {
			column_begin();
			spacer(size_pct(1));
			row_begin();
			spacer(size_pct(1));
		} break;
		//case UiAttachPos.Center: {
		//	column_begin();
		//	spacer(size_pct(0.5));
		//	row_begin();
		//	spacer(size_pct(0.5));
		//} break;
		default: break;
	}
}

export function attach_end()
{
	row_end();
	column_end();
	pop_parent();
}

const positions: Map<string, Base.Pair<number>> = new Map();
export function dragabble_begin(text: string, start_x: number = 0, start_y: number = 0)
{
	let position_from_cache = positions.get(text);
	if (!position_from_cache)
	{
		position_from_cache = [start_x, start_y];
		positions.set(text, position_from_cache);
	}

	push_next_size(AxisX, size_grow());
	push_next_size(AxisY, size_grow());
	push_next_fixed_x(position_from_cache[0]);
	push_next_fixed_y(position_from_cache[1]);
	const wid = widget_make(`dragabble--${text}`, UiClickable|UiFloating);
	const interaction = widget_with_interaction(wid);
	if (interaction.dragging)
	{
		const delta = ui_drag_delta();
		position_from_cache[0] += delta.x;
		position_from_cache[1] += delta.y;
		Base.GlobalContext!.clearRect(0, 0,
																	ui_state.root!.fixed_size[0],
																	ui_state.root!.fixed_size[1]);
		ui_reset_drag_delta();
	}
	push_parent(wid);
}

export function dragabble_end()
{
	pop_parent();
}

export function scroll(view: UiWidget)
{
	push_next_palette(Palette.default_palette);
	const container = widget_make(`${view.text}--scroll`,
																UiDrawBorder|UiDrawBackground|UiScroll|UiClickable);
	const interaction = widget_with_interaction(container);
	push_parent(container);
	pop_parent();
}


const content = Array(10).fill(0);


export function scrollable_grid_cell(id: number, cw: number, ch: number)
{
	push_next_size(AxisX, size_fixed(cw, 1));
	push_next_size(AxisY, size_fixed(ch, 1));
	push_next_background_color(Base.Hex("#FFFFFFa2"));
	push_next_rounded_corners_radii(rouded_corners(4, 4, 4, 4));
	const cell = widget_make(`inventory--content--left--${id}--cell`,
														UiDrawBorder|UiDrawBackground|UiClickable|UiRectClip);
	const interaction = widget_with_interaction(cell);
	if (interaction.clicked)
	{
	}
}

export function scrollable_grid(width:	AxisSize = size_pct(1),
																height: AxisSize = size_pct(1),
																cw: number,
																ch: number)
{
	const parent = ui_state.parent_stack.top!.value;

	push_next_size(AxisX, width);
	push_next_size(AxisY, height);
	push_next_child_axis(AxisY);
	const wid = widget_make(`${parent.text}--cell--grid`,
													 UiScrollView|UiViewClamp|UiRectClip|UiAllowOverflowY);
	widget_with_interaction(wid);

	const [w, h] = wid.rect.size;
	const cols = w / cw;
	const rows = h / ch;

	push_parent(wid);
		for (let row = 0; row < rows; row += 1)
		{
			row_begin();
			for (let col = 0; col < cols; col += 1)
			{
				column_begin();
				scrollable_grid_cell(col * rows + row, cw, ch);
				column_end();
			}
			row_end();
		}
	pop_parent();
}
