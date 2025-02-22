import * as Ui from "./ui.js";
import * as Base from "./base.js";
import * as Sprite from "./sprite.js";
import * as Palette from "./palette.js";
import * as Widget from "./widgets.js";

function editor_update_cursor()
{
	const cursor = Ui.ui_cursor();
	editor_state.cursor_screen.set(cursor.position);
	Base.camera_transform_world(editor_state.camera,
															cursor.position.x,
															cursor.position.y,
															0,
															editor_state.cursor_world);
	editor_state.cursor_world.floor();
}

const selection: Base.Ptr<Base.Rect> = Base.Ptr(Base.Rect(0,0,0,0));
function selection_begin(out: Base.Ptr<Base.Rect>): void
{
	const drag_start	= Ui.ui_state.drag_start;
	const delta				= Ui.ui_drag_delta();
	const start_world = Base.camera_transform_world(editor_state.camera,
																									drag_start.x,
																									drag_start.y - Base.TH / 2, 0,
																									Base.V2.Zero());
	let dx = Base.align_pow2(delta.x * 2, Base.TW);
	let dy = Base.align_pow2(delta.y * 2, Base.TH);
	dx = Math.max(Base.TW, Math.abs(dx));
	dy = Math.max(Base.TH, Math.abs(dy));
	dx /= Base.TW;
	dy /= Base.TH;

	selection.value.position.x = start_world.x;
	selection.value.position.y = start_world.y;
	selection.value.width		= dx;
	selection.value.height	= dy;
}

function selection_end()
{
	selection.value.position.x = 0;
	selection.value.position.y = 0;
	selection.value.width		= 0; 
	selection.value.height	= 0; 
}

enum EditorMode
{
	SelectionMode,
	FreeMode,
	CreationMode,
	EditMode,
}

const MODE_STRING = {
	[EditorMode.SelectionMode]: "Selection",
	[EditorMode.FreeMode]: "Free",
	[EditorMode.CreationMode]: "Creation",
	[EditorMode.EditMode]: "Edit",
}

enum SelectionKind {
	Tile,
	Shape,
	Face,
	None
}

enum Faces {
	Top,
	Left,
	Right
}

type FaceSelection = {
	face: Faces;
	value: Base.ConvexQuadrilateral;
	parent_id: string;
	tile: Tile;
}

type Selection = {
	kind: SelectionKind,
	data: null | FaceSelection | Tile | Shape
}

interface Tile {
	faces:		Base.IsometricFaces;
	position: Base.V2;
	layer: number;
	sprite: Sprite.Sprite|null;
	span_x: number;
	span_y: number;
	span_z: number;
	parent_id: string|null;
}

interface Shape {
	id: string;
	tiles: Tile[];
	offset: Base.V2;
	fill_sprite: Sprite.Sprite|null;
	width: number;
	height: number;
	layer: number;
	refresh_fill: boolean;
}

type EditorState = {
	shapes: Array<Shape>;
	selected_shape: null|Shape;
	selections: Selection[];
	cursor_screen:	Base.V2;
	cursor_world:		Base.V2;
	hovering_tile: Tile|null;
	next_sprite: Sprite.Sprite;
	mode: EditorMode;
	root_interaction: Omit<Ui.WidgetInteracion, "widget">,
	camera: Base.Camera,
}

const TEST_SPRITES: Sprite.Sprite[] = [
	Sprite.Sprite_new(
		Base.Rect(64, 0, 64, 64),
		"test6.png",
	),
];

const editor_state: EditorState = {
	mode: EditorMode.FreeMode,
	shapes: [], 
	next_sprite: TEST_SPRITES[0], 
	selections: [],
	selected_shape: null,
	cursor_screen:	Base.V2.Zero(),
	cursor_world:		Base.V2.Zero(),
	hovering_tile: null,
	root_interaction: {
		clicked: false,
		dragging: false,
		hovering: false,
		double_clicked: false,
		scroll_x: 0,
		scroll_y: 0
	},
	camera: Base.camera_zero(),
};

export function editor_options()
{
}

export function editor_draw(parent: Ui.UiWidget)
{
}

export function editor(parent: Ui.UiWidget)
{
	parent.flags |= Ui.UiClickable;
	editor_state.root_interaction = Ui.widget_with_interaction(parent);
	editor_update_cursor();
	editor_state.camera.width = parent.fixed_size[0];
	editor_state.camera.height = parent.fixed_size[1];

	Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
	Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
}

Ui.on_frame_end(() => {
	for (let i = 0; i < 10; i += 1)
	{
		const test = tile_init(null, 0, 0, i);
		tile_draw(test, Sprite.sprite_sources[0]);
	}
});

function tile_build_faces(tile: Tile, offset_x: number = 0, offset_y: number = 0, layer_offset: number = 0)
{
	const top		= tile.faces.top;
	const left	= tile.faces.left;
	const right = tile.faces.right;

	top[0].setn(tile.position.x + offset_x,
							tile.position.y + offset_y,
							tile.layer			+ layer_offset	+ tile.span_z);

	top[1].setn(tile.position.x + offset_x,
							tile.position.y + offset_y			+ tile.span_y,
							tile.layer			+ layer_offset	+ tile.span_z);

	top[2].setn(tile.position.x + offset_x			+ tile.span_x,
							tile.position.y + offset_y			+ tile.span_y,
							tile.layer			+ layer_offset	+ tile.span_z);

	top[3].setn(tile.position.x + offset_x			+ tile.span_x,
							tile.position.y + offset_y,
							tile.layer			+ layer_offset	+ tile.span_z);

	left[0].setn(tile.position.x	+ offset_x,
							 tile.position.y	+ offset_y + tile.span_y,
							 tile.layer				+ layer_offset);
	left[1].setn(tile.position.x	+ offset_x + tile.span_x,
							 tile.position.y	+ offset_y + tile.span_y,
							 tile.layer				+ layer_offset);
	left[2].set(top[2]);
	left[3].set(top[1]);

	right[0].set(left[1]);
	right[1].setn(tile.position.x + offset_x + tile.span_x,
								tile.position.y + offset_y,
								tile.layer			+ layer_offset);
	right[2].set(top[3]);
	right[3].set(top[2]);
}

function tile_init(
	parent_id: string | null = null,
	wx: number, wy: number, layer: number,
	sprite: Sprite.Sprite | null = null,
	tile_span_x: number = 1, tile_span_y: number = 1, tile_span_z: number = 1)
{
	if (sprite)
	{
		tile_span_x = Base.Round(sprite.rect.width / Base.TW);
		tile_span_y = Base.Round(sprite.rect.height / (Base.TH * 2));
	}
	const tile: Tile = {
		faces: {
			top: [
				Base.V2.Zero(),
				Base.V2.Zero(),
				Base.V2.Zero(),
				Base.V2.Zero()
			],
			left: [
				Base.V2.Zero(),
				Base.V2.Zero(),
				Base.V2.Zero(),
				Base.V2.Zero()
			],
			right: [
				Base.V2.Zero(),
				Base.V2.Zero(),
				Base.V2.Zero(),
				Base.V2.Zero()
			]
		},
		position: Base.V2.New(wx, wy, layer),
		layer,
		sprite,
		span_x: tile_span_x,
		span_y: tile_span_y,
		span_z: tile_span_z,
		parent_id: parent_id 
	}
	tile_build_faces(tile);
	return tile;
}

function tile_copy(tile: Tile, new_parent_id: string | null = null): Tile
{
	return tile_init(new_parent_id ? new_parent_id : tile.parent_id,
									 tile.position.x,
									 tile.position.y,
									 tile.layer,
									 tile.sprite,
									 tile.span_x,
									 tile.span_y,
									 tile.span_z);
}

function highlight_face(face: Base.ConvexQuadrilateral, color = "#FFFFFF") {
	const ctx = Base.GlobalContext!;
	ctx.lineWidth = 4;
	ctx.strokeStyle = color;
	const [a, b, c, d] = face;
	ctx.beginPath();
	ctx.moveTo(...a.array());
	ctx.lineTo(...b.array());
	ctx.moveTo(...b.array());
	ctx.lineTo(...c.array());
	ctx.moveTo(...c.array());
	ctx.lineTo(...d.array());
	ctx.moveTo(...d.array());
	ctx.lineTo(...a.array());
	ctx.stroke();
}

function tile_draw(tile: Tile,
									 src: Sprite.SpriteSource,
									 offset_x: number = 0,
									 offset_y: number = 0,
									 layer_offset: number = 0)
{
	if (tile.sprite && src)
	{
		const screen_position =  Base.camera_transform_screen(editor_state.camera,
																													tile.position.x + offset_x,
																													tile.position.y + offset_y,
																													tile.layer			+ layer_offset,
																													Base.V2.Zero(),
																													-Base.TW/2,
																													-Base.TW/2);
		Sprite.draw_from_image_(Base.GlobalContext!,
														src,
														tile.sprite,
														screen_position.x,
														screen_position.y,
														editor_state.camera.zoom);
	}
	highlight_face(Base.face_to_screen(editor_state.camera, tile.faces.top));
	highlight_face(Base.face_to_screen(editor_state.camera, tile.faces.left));
	highlight_face(Base.face_to_screen(editor_state.camera, tile.faces.right));
}


const controls: Map<number, [Base.Ptr<boolean>, position: Base.V2]> = new Map();
function ui_sprite_selector(bitmap: Sprite.SpriteSource, selection: Base.Ptr<Sprite.Sprite>, control_id: number)
{
	let control_data = controls.get(control_id);
	if (!control_data)
	{
		control_data = [Base.Ptr<boolean>(false), Base.V2.New(-1, -1)];
		controls.set(control_id, control_data);
	}
	let [control, position]	= control_data; 

	if (control.value)
	{
		if (position.x === -1 &&
				position.y === -1)
		{
			const {x, y} = editor_state.cursor_screen;
			position.x = x;
			position.y = y - 70;
		}
		Ui.push_next_fixed_width(300);
		Ui.push_next_fixed_height(300);
		Ui.push_next_fixed_x(position.x);
		Ui.push_next_fixed_y(position.y);
		Ui.push_next_background_color(Base.RGBA(255, 255, 0, 0.3));
		const c = Ui.widget_make("ui--sprite--selector--" + control_id, Ui.UiDrawBackground|Ui.UiFloating);
		Ui.push_parent(c);
			Ui.push_bitmap(bitmap);
				for (let i = 0; i < TEST_SPRITES.length; i += 1)
				{
					const sprite = TEST_SPRITES[i];
					Ui.spacer(Ui.size_fixed(5));
					Ui.push_next_size(Ui.AxisX, Ui.size_fixed(sprite.rect.width, 1));
					Ui.push_next_size(Ui.AxisY, Ui.size_fixed(sprite.rect.height, 1));
					Ui.push_next_background_color(Base.RGBA(0, 0, 0, 0.1));
					Ui.push_next_bitmap_region(Ui.ui_rect(sprite.rect.position.x, sprite.rect.position.y, sprite.rect.width, sprite.rect.height));
					const cell = Ui.Container("ui--sprite--selector--cell--" + (i * control_id + i), Ui.UiDrawBorder|Ui.UiDrawBitmap|Ui.UiClickable);
					if (cell.clicked)
					{
						selection.value = sprite;
						control.value = false;
					}
				}
			Ui.pop_bitmap();
		Ui.pop_parent();
	}
	return control;
}
