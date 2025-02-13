import * as Ui from "./ui.js";
import * as Base from "./base.js";
import * as Sprite from "./sprite.js";
import * as Input from "./input.js";
const editor_camera = {
    width: 0,
    height: 0,
    x: 0, y: 0, z: 0,
    world_position: Base.V2.Zero(),
    is_locked: false,
    zoom: 1
};
export function editor_set_size(w, h) {
    editor_state.window_width = w;
    editor_state.window_height = h;
    editor_camera.width = w;
    editor_camera.height = h;
}
function editor_update_cursor() {
    const cursor = Ui.ui_cursor();
    editor_state.cursor_screen.set(cursor.position);
    Base.camera_transform_world(editor_camera, cursor.position.x, cursor.position.y, 0, editor_state.cursor_world);
    editor_state.cursor_world.floor();
}
function draw_editor_dynamic_info() {
}
function draw_editor_state_info() {
}
function get_selection(out) {
    const drag_start = Ui.ui_state.drag_start;
    const delta = Ui.ui_drag_delta();
    const start_world = Base.camera_transform_world(editor_camera, drag_start.x, drag_start.y - Base.TH / 2, 0, Base.V2.Zero());
    let dx = Base.align_pow2(delta.x * 2, Base.TW);
    let dy = Base.align_pow2(delta.y * 2, Base.TH);
    dx = Math.max(Base.TW, Math.abs(dx));
    dy = Math.max(Base.TH, Math.abs(dy));
    dx /= Base.TW;
    dy /= Base.TH;
    out.value.position.x = start_world.x;
    out.value.position.y = start_world.y;
    out.value.width = dx;
    out.value.height = dy;
}
var EditorMode;
(function (EditorMode) {
    EditorMode[EditorMode["SelectionMode"] = 0] = "SelectionMode";
    EditorMode[EditorMode["FreeMode"] = 1] = "FreeMode";
    EditorMode[EditorMode["CreationMode"] = 2] = "CreationMode";
    EditorMode[EditorMode["EditMode"] = 3] = "EditMode";
})(EditorMode || (EditorMode = {}));
const MODE_STRING = {
    [EditorMode.SelectionMode]: "Selection",
    [EditorMode.FreeMode]: "Free",
    [EditorMode.CreationMode]: "Creation",
    [EditorMode.EditMode]: "Edit",
};
function editor_get_mode() {
    let mode = EditorMode.FreeMode;
    if (Input.is_down(Input.KKey.KEY_Shift)) {
        mode = editor_state.selections.length > 0 ? EditorMode.EditMode : EditorMode.CreationMode;
    }
    if (Input.is_down(Input.KKey.KEY_Ctrl)) {
        mode = EditorMode.SelectionMode;
    }
    return (mode);
}
function editor_handle_free_mode() {
    const dragging = editor_state.root_interaction_dragging;
    const scroll_y = editor_state.scroll_y;
    if (dragging) {
        const delta = Ui.ui_drag_delta();
        editor_camera.x += delta.x * editor_state.dt * 35;
        editor_camera.y += delta.y * editor_state.dt * 35;
        Ui.ui_reset_drag_delta();
    }
    if (scroll_y !== 0) {
        editor_camera.zoom = Base.Clamp(editor_camera.zoom - (0.5 * Math.sign(scroll_y)), 0.3, 2);
    }
}
const r = Base.Ptr(Base.Rect(0, 0, 0, 0));
function editor_handle_creation_mode() {
    const dragging = editor_state.root_interaction_dragging;
    const rect = r.value;
    if (dragging) {
        const cursor = editor_state.cursor_screen;
        Ui.push_next_fixed_x(cursor.x);
        Ui.push_next_fixed_y(cursor.y);
        Ui.push_next_size(Ui.AxisX, Ui.size_grow());
        Ui.push_next_size(Ui.AxisY, Ui.size_grow());
        Ui.push_next_background_color(Base.RGBA(255, 255, 255, 0.2));
        Ui.push_next_child_axis(Ui.AxisY);
        const info = Ui.widget_make("pocket_world--creation--mode--selection--info", Ui.UiDrawBackground);
        Ui.push_parent(info);
        //	Ui.ui_cell(Ui.size_fixed(10), function() {
        //		Ui.push_next_size(Ui.AxisX, Ui.size_text_content());
        //		Ui.push_next_size(Ui.AxisY, Ui.size_text_content());
        //		Ui.push_next_text_alignment(Ui.UiTextAlignment.Left);
        //		Ui.ui_widget_make(`pocket_world--creation--mode--selection--info--size#w(${rect.width}) h(${rect.height})`, Ui.UiDrawText);
        //	})
        //Ui.ui_cell(Ui.size_fixed(10), function() {
        //	Ui.push_next_size(Ui.AxisX, Ui.size_text_content());
        //	Ui.push_next_size(Ui.AxisY, Ui.size_text_content());
        //	Ui.push_next_text_alignment(Ui.UiTextAlignment.Left);
        //	Ui.ui_widget_make(`pocket_world--creation--mode--selection--info--position#x(${rect.position.x}) y(${rect.position.y})`, Ui.UiDrawText);
        //})
        Ui.pop_parent();
        get_selection(r);
        //const test: Base.ConvexQuadrilateral = [
        //	Base.V2.New(rect.position.x, rect.position.y, 0),
        //	Base.V2.New(rect.position.x, rect.position.y + rect.height, 0),
        //	Base.V2.New(rect.position.x + rect.width, rect.position.y + rect.height, 0),
        //	Base.V2.New(rect.position.x + rect.width, rect.position.y, 0),
        //];
        //
        //const t = Base.face_to_screen(editor_camera, test);
        //highlight_face(t, "#FFFF00");
        for (let y = 0; y < rect.height; y += 1) {
            for (let x = 0; x < rect.width; x += 1) {
                const tile = tile_init(null, rect.position.x + x, rect.position.y + y, 0);
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.top), "#FFFFFF");
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.left), "#FFFFFF");
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.right), "#FFFFFF");
            }
        }
    }
    if (!dragging) {
        const shape_id = crypto.randomUUID();
        if (rect.width > 0 && rect.height > 0) {
            const tiles = [];
            for (let y = 0; y < rect.height; y += 1) {
                for (let x = 0; x < rect.width; x += 1) {
                    const tile = tile_init(shape_id, x, y, -1, TEST_FLOORS[0], 1, 1, 0.5);
                    tiles.push(tile);
                }
            }
            const shape = {
                id: shape_id,
                refresh_fill: false,
                tiles,
                offset: Base.V2.Zero().set(rect.position),
                width: rect.width,
                height: rect.height,
                layer: 0,
                fill_sprite: editor_state.next_sprite
            };
            editor_state.shapes.push(shape);
            rect.position.setn(0, 0);
            rect.width = rect.height = 0;
        }
    }
}
function editor_handle_selection_mode() {
    for (let i = editor_state.shapes.length - 1; i >= 0; i -= 1) {
        const shape = editor_state.shapes[i];
        for (let j = shape.tiles.length - 1; j >= 0; j -= 1) {
            const tile = shape.tiles[j];
            const top_screen = Base.face_to_screen(editor_camera, tile.faces.top);
            const left_screen = Base.face_to_screen(editor_camera, tile.faces.left);
            const right_screen = Base.face_to_screen(editor_camera, tile.faces.right);
            const selection = { kind: SelectionKind.None, data: null };
            const double_clicked = editor_state.root_interaction_dclicked;
            let can_select = (editor_state.root_interaction_clicked || double_clicked) &&
                !editor_state.root_interaction_dragging &&
                !editor_state.hovering_tile;
            const hovering_top_face = Base.point_in_convex_quadrilateral(editor_state.cursor_screen, top_screen);
            const hovering_left_face = Base.point_in_convex_quadrilateral(editor_state.cursor_screen, left_screen);
            const hovering_right_face = Base.point_in_convex_quadrilateral(editor_state.cursor_screen, right_screen);
            if (hovering_top_face && can_select) {
                selection.kind = SelectionKind.Face;
                selection.data = { face: Faces.Top, value: tile.faces.top, parent_id: shape.id, tile };
            }
            else if (hovering_left_face && can_select) {
                selection.kind = SelectionKind.Face;
                selection.data = { face: Faces.Left, value: tile.faces.left, parent_id: shape.id, tile };
            }
            else if (hovering_right_face && can_select) {
                selection.kind = SelectionKind.Face;
                selection.data = { face: Faces.Right, value: tile.faces.right, parent_id: shape.id, tile };
            }
            if (hovering_top_face ||
                hovering_left_face ||
                hovering_right_face) {
                if (can_select && double_clicked) {
                    selection.kind = SelectionKind.Tile;
                    selection.data = tile;
                    if (Input.is_down(Input.KKey.KEY_A)) {
                        selection.kind = SelectionKind.Shape;
                        selection.data = shape;
                    }
                }
                if (editor_state.hovering_tile === null) {
                    editor_state.hovering_tile = tile;
                }
            }
            if (selection.kind !== SelectionKind.None) {
                if (already_selected(selection)) {
                    remove_selection(selection);
                }
                else {
                    editor_state.selections.push(selection);
                }
            }
        }
    }
    if (Input.is_pressed(Input.KKey.KEY_Y) && editor_state.selections.length > 0) {
        for (let i = 0; i < editor_state.shapes.length; i += 1) {
            const shape = editor_state.shapes[i];
            if (is_shape_selected(shape)) {
                for (let j = 0; j < editor_state.selections.length; j += 1) {
                    const sel = editor_state.selections[j];
                    //@ts-ignore
                    const id = sel.kind !== SelectionKind.Shape ? sel.data.parent_id : sel.data.id;
                    if (id === shape.id) {
                        editor_state.selections.splice(j, 1);
                        j--;
                    }
                }
                editor_state.shapes.splice(i, 1);
                i--;
                if (shape === editor_state.selected_shape) {
                    editor_state.selected_shape = null;
                }
            }
        }
    }
    if (Input.is_pressed(Input.KKey.KEY_V)) {
        if (editor_state.selections.length > 0) {
            for (let i = 0; i < editor_state.selections.length; i += 1) {
                if (editor_state.selections[i].kind === SelectionKind.Shape) {
                    const shape = editor_state.selections[i].data;
                    const id = crypto.randomUUID();
                    const tiles = [];
                    for (let i = 0; i < shape.tiles.length; i += 1) {
                        const tile = shape.tiles[i];
                        tiles.push(tile_copy(tile, id));
                    }
                    remove_selection({ kind: SelectionKind.Shape, data: shape });
                    const new_shape = {
                        id: id,
                        refresh_fill: false,
                        tiles,
                        offset: Base.V2.Zero().set(shape.offset),
                        width: shape.width,
                        height: shape.height,
                        layer: shape.layer,
                        fill_sprite: shape.fill_sprite
                    };
                    editor_state.selections.push({ kind: SelectionKind.Shape, data: new_shape });
                    editor_state.shapes.push(new_shape);
                }
            }
        }
    }
}
function shape_add_walls(shape) {
    const len = shape.tiles.length;
    const new_tiles = [];
    for (let i = 0; i < len; i += 1) {
        const tile = shape.tiles[i];
        for (let layer = 0; layer < 6; layer += 1) {
            let l = (tile.layer + (tile.span_z < 1 ? tile.span_z : -tile.span_z)) + layer;
            if (tile.position.x === 0 &&
                tile.position.y === 0) {
                const corner = tile_init(shape.id, -1, -1, l, WALL_CORNER, 0.5, 0.5, 1);
                new_tiles.push(corner);
            }
            if (tile.position.y === 0) {
                const wall = tile_init(shape.id, tile.position.x, -1, l, TEST_WALLS[0][1], 1, 0.5, 1);
                new_tiles.unshift(wall);
            }
            if (tile.position.x === 0) {
                const wall = tile_init(shape.id, -1, tile.position.y, l, TEST_WALLS[0][0], 0.5, 1, 1);
                new_tiles.unshift(wall);
            }
        }
    }
    for (let i = 0; i < new_tiles.length; i += 1) {
        shape.tiles.unshift(new_tiles[i]);
    }
    const test = tile_init(shape.id, 0, 0, 0, TEST_SPRITES[0]);
    shape.tiles.push(test);
}
function editor_connect_shapes() {
    const shapes = [];
    foreach_selection(sel => {
        if (sel.kind === SelectionKind.Shape) {
            shapes.push(sel.data);
        }
    });
    if (shapes.length !== 2)
        return;
    const a = shapes[0];
    const b = shapes[1];
    if (Input.is_pressed(Input.KKey.KEY_M)) {
    }
}
const edit_mode_selection = Base.Ptr(Base.Rect(0, 0, 0, 0));
function editor_handle_edit_mode() {
    editor_connect_shapes();
    let move_x = 0;
    let move_y = 0;
    let move_layer = 0;
    if (Input.is_pressed(Input.KKey.KEY_ArrowDown)) {
        if (Input.is_down(Input.KKey.KEY_L)) {
            move_layer = -1;
        }
        else {
            move_x = 1;
            move_y = 1;
        }
    }
    if (Input.is_pressed(Input.KKey.KEY_ArrowUp)) {
        if (Input.is_down(Input.KKey.KEY_L)) {
            move_layer = 1;
        }
        else {
            move_x = -1;
            move_y = -1;
        }
    }
    if (Input.is_pressed(Input.KKey.KEY_ArrowLeft)) {
        //move_x = -1;
        move_y = 1;
    }
    if (Input.is_pressed(Input.KKey.KEY_ArrowRight)) {
        move_x = 1;
        //move_y = 1;
    }
    foreach_selection(sel => {
        if (sel.kind === SelectionKind.Shape) {
            const shape = sel.data;
            shape.offset.x += move_x;
            shape.offset.y += move_y;
            shape.layer += move_layer;
        }
    });
}
function draw_shapes() {
    for (let i = 0; i < editor_state.shapes.length; i += 1) {
        const shape = editor_state.shapes[i];
        shape.offset.floor();
        for (let j = 0; j < shape.tiles.length; j += 1) {
            const tile = shape.tiles[j];
            tile_build_faces(tile, shape.offset.x, shape.offset.y, shape.layer);
            const top_screen = Base.face_to_screen(editor_camera, tile.faces.top);
            if (Base.point_in_convex_quadrilateral(editor_state.cursor_screen, top_screen) &&
                editor_state.root_interaction_clicked) {
                editor_state.selected_shape = shape;
            }
            let color = "#FFFFFF32";
            if (is_shape_selected(shape)) {
                color = "#FF0000";
                highlight_face(top_screen, color);
            }
            if (is_tile_selected(tile)) {
                color = "#00FF00";
                highlight_face(top_screen, color);
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.left), color);
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.right), color);
            }
            if (is_face_selected(tile.faces.top)) {
                highlight_face(top_screen, "#FF0000");
            }
            if (is_face_selected(tile.faces.left)) {
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.left), "#00FF00");
            }
            if (is_face_selected(tile.faces.right)) {
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.right), "#0000FF");
            }
            if (tile === editor_state.hovering_tile) {
                color = "#FFFF00";
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.left), color);
                highlight_face(Base.face_to_screen(editor_camera, tile.faces.right), color);
            }
            if ((shape.fill_sprite && tile.sprite === null) || shape.refresh_fill) {
                tile.sprite = shape.fill_sprite;
            }
            tile_draw(tile, Ui.ui_state.bitmap_stack.top.value, shape.offset.x, shape.offset.y, shape.layer);
        }
        shape.refresh_fill = false;
    }
}
export function editor(dt, test_bitmap) {
    Base.GlobalContext.clearRect(0, 0, editor_camera.width, editor_camera.height);
    Ui.ui_frame_begin(dt, editor_state.window_width, editor_state.window_height);
    Ui.push_next_size(Ui.AxisX, Ui.size_pct(1));
    Ui.push_next_size(Ui.AxisY, Ui.size_pct(1));
    Ui.push_next_background_color(Base.RGBA_FULL_TRANSPARENT);
    Ui.push_next_child_axis(Ui.AxisY);
    Ui.push_bitmap(test_bitmap);
    const editor_area = Ui.Container("pocket_world--editor", Ui.UiDrawBorder | Ui.UiClickable | Ui.UiScroll);
    editor_update_cursor();
    editor_state.hovering_tile = null;
    editor_state.root_interaction_dragging = editor_area.dragging;
    editor_state.root_interaction_clicked = editor_area.clicked;
    editor_state.scroll_y = editor_area.scroll_y;
    editor_state.root_interaction_dclicked = editor_area.double_clicked;
    editor_state.dt = dt;
    Base.camera_transform_world(editor_camera, editor_camera.x, editor_camera.y, editor_camera.z, editor_camera.world_position);
    editor_camera.world_position.floor();
    draw_shapes();
    if (Input.is_pressed(Input.KKey.KEY_Escape)) {
        editor_state.selections = [];
        editor_state.selected_shape = null;
    }
    editor_state.mode = editor_get_mode();
    switch (editor_state.mode) {
        case EditorMode.FreeMode:
            {
                editor_handle_free_mode();
            }
            break;
        case EditorMode.CreationMode:
            {
                editor_handle_creation_mode();
            }
            break;
        case EditorMode.EditMode:
            {
                editor_handle_edit_mode();
            }
            break;
        case EditorMode.SelectionMode:
            {
                editor_handle_selection_mode();
            }
            break;
        default: break;
    }
    draw_editor_state_info();
    draw_editor_dynamic_info();
    Ui.pop_bitmap();
    Ui.ui_frame_end();
}
var SelectionKind;
(function (SelectionKind) {
    SelectionKind[SelectionKind["Tile"] = 0] = "Tile";
    SelectionKind[SelectionKind["Shape"] = 1] = "Shape";
    SelectionKind[SelectionKind["Face"] = 2] = "Face";
    SelectionKind[SelectionKind["None"] = 3] = "None";
})(SelectionKind || (SelectionKind = {}));
var Faces;
(function (Faces) {
    Faces[Faces["Top"] = 0] = "Top";
    Faces[Faces["Left"] = 1] = "Left";
    Faces[Faces["Right"] = 2] = "Right";
})(Faces || (Faces = {}));
const WALL_CORNER = Sprite.Sprite_new(Base.Rect(128, 64, 64, 64), "test6.png");
const TEST_WALLS = [
    [
        Sprite.Sprite_new(Base.Rect(0, 64, 64, 64), "test6.png"),
        Sprite.Sprite_new(Base.Rect(64, 64, 64, 64), "test6.png"),
    ]
];
const TEST_STAIRS = [
    [
        Sprite.Sprite_new(Base.Rect(0, 128, 64, 64), "test6.png"),
        Sprite.Sprite_new(Base.Rect(64, 128, 64, 64), "test6.png"),
    ]
];
const TEST_FLOORS = [
    Sprite.Sprite_new(Base.Rect(0, 0, 64, 64), "test6.png"),
];
const TEST_SPRITES = [
    Sprite.Sprite_new(Base.Rect(64, 0, 64, 64), "test6.png"),
];
const editor_state = {
    mode: EditorMode.FreeMode,
    shapes: [],
    scroll_y: 0,
    dt: 0,
    next_sprite: TEST_SPRITES[0],
    selections: [],
    selected_shape: null,
    cursor_screen: Base.V2.Zero(),
    cursor_world: Base.V2.Zero(),
    window_width: 0,
    window_height: 0,
    hovering_tile: null,
    root_interaction_dragging: false,
    root_interaction_clicked: false,
    root_interaction_dclicked: false,
};
function editor_remove_shape(shape_id) {
    for (let i = 0; i < editor_state.shapes.length; i += 1) {
        if (editor_state.shapes[i].id === shape_id) {
            editor_state.shapes.splice(i, 1);
            i--;
        }
    }
}
function find_shape_by_id(id) {
    let found = null;
    for (let i = 0; i < editor_state.shapes.length; i += 1) {
        if (editor_state.shapes[i].id === id) {
            found = editor_state.shapes[i];
            break;
        }
    }
    return (found);
}
function foreach_selection(cb) {
    for (let i = 0; i < editor_state.selections.length; i += 1) {
        cb(editor_state.selections[i]);
    }
}
function remove_selection(sel) {
    let i = 0;
    for (i; i < editor_state.selections.length; i += 1) {
        const selection = editor_state.selections[i];
        if (selection.kind === SelectionKind.Face) {
            const data = selection.data;
            const new_ = sel.data;
            if (data.face === new_.face &&
                data.value === new_.value) {
                break;
            }
            continue;
        }
        if (selection.kind === sel.kind &&
            selection.data === sel.data) {
            break;
        }
    }
    editor_state.selections.splice(i, 1);
}
function already_selected(sel) {
    let ret = false;
    for (let i = 0; i < editor_state.selections.length; i += 1) {
        const selection = editor_state.selections[i];
        if (selection.kind === SelectionKind.Face) {
            const data = selection.data;
            const new_ = sel.data;
            if (data.face === new_.face &&
                data.value === new_.value) {
                ret = true;
                break;
            }
            continue;
        }
        if (selection.kind === sel.kind &&
            selection.data === sel.data) {
            ret = true;
            break;
        }
    }
    return (ret);
}
function is_shape_selected(shape) {
    let ret = false;
    for (let i = 0; i < editor_state.selections.length; i += 1) {
        const selection = editor_state.selections[i];
        if (selection.kind === SelectionKind.Shape) {
            if (selection.data === shape) {
                ret = true;
                break;
            }
        }
    }
    return (ret);
}
function is_face_selected(face) {
    let ret = false;
    for (let i = 0; i < editor_state.selections.length; i += 1) {
        const selection = editor_state.selections[i];
        if (selection.kind === SelectionKind.Face) {
            const data = selection.data;
            if (data.value === face) {
                ret = true;
                break;
            }
        }
    }
    return (ret);
}
function is_tile_selected(tile) {
    let ret = false;
    for (let i = 0; i < editor_state.selections.length; i += 1) {
        const selection = editor_state.selections[i];
        if (selection.kind === SelectionKind.Tile) {
            if (selection.data === tile) {
                ret = true;
                break;
            }
        }
    }
    return (ret);
}
const controls = new Map();
function ui_sprite_selector(bitmap, selection, control_id) {
    let control_data = controls.get(control_id);
    if (!control_data) {
        control_data = [Base.Ptr(false), Base.V2.New(-1, -1)];
        controls.set(control_id, control_data);
    }
    let [control, position] = control_data;
    if (control.value) {
        if (position.x === -1 &&
            position.y === -1) {
            const { x, y } = editor_state.cursor_screen;
            position.x = x;
            position.y = y - 70;
        }
        Ui.push_next_fixed_width(300);
        Ui.push_next_fixed_height(300);
        Ui.push_next_fixed_x(position.x);
        Ui.push_next_fixed_y(position.y);
        Ui.push_next_background_color(Base.RGBA(255, 255, 0, 0.3));
        const c = Ui.widget_make("ui--sprite--selector--" + control_id, Ui.UiDrawBackground | Ui.UiFloating);
        Ui.push_parent(c);
        Ui.push_bitmap(bitmap);
        for (let i = 0; i < TEST_SPRITES.length; i += 1) {
            const sprite = TEST_SPRITES[i];
            Ui.spacer(Ui.size_fixed(5));
            Ui.push_next_size(Ui.AxisX, Ui.size_fixed(sprite.rect.width, 1));
            Ui.push_next_size(Ui.AxisY, Ui.size_fixed(sprite.rect.height, 1));
            Ui.push_next_background_color(Base.RGBA(0, 0, 0, 0.1));
            Ui.push_next_bitmap_region(Ui.ui_rect(sprite.rect.position.x, sprite.rect.position.y, sprite.rect.width, sprite.rect.height));
            const cell = Ui.Container("ui--sprite--selector--cell--" + (i * control_id + i), Ui.UiDrawBorder | Ui.UiDrawBitmap | Ui.UiClickable);
            if (cell.clicked) {
                selection.value = sprite;
                control.value = false;
            }
        }
        Ui.pop_bitmap();
        Ui.pop_parent();
    }
    return control;
}
function tile_build_faces(tile, offset_x = 0, offset_y = 0, layer_offset = 0) {
    const top = tile.faces.top;
    const left = tile.faces.left;
    const right = tile.faces.right;
    top[0].setn(tile.position.x + offset_x, tile.position.y + offset_y, tile.layer + layer_offset + tile.span_z);
    top[1].setn(tile.position.x + offset_x, tile.position.y + offset_y + tile.span_y, tile.layer + layer_offset + tile.span_z);
    top[2].setn(tile.position.x + offset_x + tile.span_x, tile.position.y + offset_y + tile.span_y, tile.layer + layer_offset + tile.span_z);
    top[3].setn(tile.position.x + offset_x + tile.span_x, tile.position.y + offset_y, tile.layer + layer_offset + tile.span_z);
    left[0].setn(tile.position.x + offset_x, tile.position.y + offset_y + tile.span_y, tile.layer + layer_offset);
    left[1].setn(tile.position.x + offset_x + tile.span_x, tile.position.y + offset_y + tile.span_y, tile.layer + layer_offset);
    left[2].set(top[2]);
    left[3].set(top[1]);
    right[0].set(left[1]);
    right[1].setn(tile.position.x + offset_x + tile.span_x, tile.position.y + offset_y, tile.layer + layer_offset);
    right[2].set(top[3]);
    right[3].set(top[2]);
}
function tile_init(parent_id = null, wx, wy, layer, sprite = null, tile_span_x = 1, tile_span_y = 1, tile_span_z = 1) {
    if (sprite) {
        tile_span_x = Base.Round(sprite.rect.width / Base.TW);
        tile_span_y = Base.Round(sprite.rect.height / (Base.TH * 2));
    }
    const tile = {
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
    };
    tile_build_faces(tile);
    return tile;
}
function tile_draw(tile, src, offset_x = 0, offset_y = 0, layer_offset = 0) {
    if (tile.sprite && src) {
        const screen_position = Base.camera_transform_screen(editor_camera, tile.position.x + offset_x, tile.position.y + offset_y, tile.layer + layer_offset, Base.V2.Zero(), -Base.TW / 2, -Base.TW / 2);
        Sprite.draw_from_image_(Base.GlobalContext, src, tile.sprite, screen_position.x, screen_position.y, editor_camera.zoom);
    }
}
function tile_copy(tile, new_parent_id = null) {
    return tile_init(new_parent_id ? new_parent_id : tile.parent_id, tile.position.x, tile.position.y, tile.layer, tile.sprite, tile.span_x, tile.span_y, tile.span_z);
}
function highlight_face(face, color = "#FFFFFF") {
    const ctx = Base.GlobalContext;
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
