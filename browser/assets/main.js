var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Vector2, Vector3 } from "./base.js";
import { SPRITES, ObjectDefaultConfig, TILES } from "./sprite.js";
class Camera {
    constructor(x, y) {
        this.position = Vector2.zero();
        this.position.x = x;
        this.position.y = y;
        this.scale = 1;
    }
    to_grid() {
        return this.reverse_transform(this.position);
    }
    transform(grid_pos, offset) {
        if (offset) {
            return grid_pos.toScreen().add(offset).scale(this.scale).add(this.position);
        }
        return grid_pos.toScreen().scale(this.scale).add(this.position);
    }
    reverse_transform(screen_pos, offset) {
        if (offset) {
            return screen_pos.sub(this.position).sub(offset).toGrid().scale(1 / this.scale);
        }
        return screen_pos.sub(this.position).toGrid().scale(1 / this.scale);
    }
    set_scale(n) {
        this.scale = n;
    }
}
let DEBUG = false;
let ROOM_SHAPE = [];
const room_width = 20;
const room_height = 20;
function convex_quadrilateral_subdivide(quad, quad_span, div_span) {
    const ratio = div_span.divide(quad_span);
    if (ratio.x === 1 && ratio.y === 1) {
        return [];
    }
    if (ratio.x !== ratio.y) {
        if (ratio.x < ratio.y) {
            ratio.y = Math.floor(ratio.y) === 0 ? ratio.y : Math.floor(ratio.y);
        }
        else {
            ratio.x = Math.floor(ratio.x) === 0 ? ratio.x : Math.floor(ratio.x);
        }
    }
    const step = quad_span.mul(ratio);
    const out = [];
    for (let y = 0; y < Math.floor(1 / ratio.y); y++) {
        for (let x = 0; x < Math.floor(1 / ratio.x); x++) {
            const top_left = quad[0].add2(x * step.x, -y * step.y);
            const bottom_left = top_left.add2(0, -step.y);
            const bottom_right = bottom_left.add2(step.x, 0);
            const top_right = top_left.add2(step.x, 0);
            out.push([top_left, bottom_left, bottom_right, top_right]);
        }
    }
    return out;
}
function point_in_convex_quadrilateral(p, r) {
    const e1 = r[1].sub(r[0]);
    const e2 = r[2].sub(r[1]);
    const e3 = r[3].sub(r[2]);
    const e4 = r[0].sub(r[3]);
    const d1 = p.sub(r[0]).add2(0.3, 0.3);
    const d2 = p.sub(r[1]).add2(0.3, 0.3);
    const d3 = p.sub(r[2]).add2(0.3, 0.3);
    const d4 = p.sub(r[3]).add2(0.3, 0.3);
    const c1 = e1.cross(d1);
    const c2 = e2.cross(d2);
    const c3 = e3.cross(d3);
    const c4 = e4.cross(d4);
    return (c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0) || (c1 < 0 && c2 < 0 && c3 < 0 && c4 < 0);
}
// return screen and grid coordinates of visible faces of 2d isometric object
function object_get_visible_faces(obj, camera) {
    const bottom_face = [
        obj.position,
        obj.position.add2(0, obj.xy_span.y, 0),
        obj.position.add2(obj.xy_span.x, obj.xy_span.y, 0),
        obj.position.add2(obj.xy_span.x, 0, 0),
    ];
    const top_face = [
        obj.position.add2(0, 0, obj.z_span),
        obj.position.add2(0, obj.xy_span.y, obj.z_span),
        obj.position.add2(obj.xy_span.x, obj.xy_span.y, obj.z_span),
        obj.position.add2(obj.xy_span.x, 0, obj.z_span),
    ];
    const left_face = [
        top_face[1],
        bottom_face[1],
        bottom_face[2],
        top_face[2],
    ];
    const right_face = [
        top_face[2],
        bottom_face[2],
        bottom_face[3],
        top_face[3],
    ];
    return [[
            top_face.map(v => camera.transform(v)),
            left_face.map(v => camera.transform(v)),
            right_face.map(v => camera.transform(v))
        ],
        [bottom_face, top_face, left_face, right_face]
    ];
}
function object_outline_faces(ctx, quad, color) {
    for (const face of quad) {
        const [a, b, c, d] = face;
        ctx.strokeStyle = "#0000FF";
        if (color !== undefined)
            ctx.strokeStyle = color;
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
}
const draw_sprite = (ctx, sprites, sprite, position, camera) => {
    const start_draw = camera.transform(position, sprite.offset);
    const sprite_size = sprite.size.scale(camera.scale);
    ctx.drawImage(sprites, sprite.start.x, sprite.start.y, sprite.size.x, sprite.size.y, start_draw.x, start_draw.y, sprite_size.x, sprite_size.y);
};
for (let x = 0; x < room_width; x++) {
    for (let y = 0; y < room_height; y++) {
        ROOM_SHAPE.push(new Vector3(x, y, 0));
    }
}
let ROOM = [
    Object.assign(Object.assign({}, ObjectDefaultConfig), { sprite: SPRITES.entities[0], label: "player", can_stack: false, is_solid: true, z_span: 2, xy_span: new Vector2(1, 1), snapping: {
            can_snap_top: (_) => false,
            can_snap_left: (_) => false,
            can_snap_right: (_) => false,
        } }),
];
const lerp = (a, b, t) => a + (b - a) * t;
let is_animating = false;
const animate_movement = (ctx, w, h, set_pos, dt, path, spd, step) => {
    is_animating = true;
    if (step >= path.length - 1) {
        set_pos(path.pop(), 1);
        is_animating = false;
        return;
    }
    const start = path[step];
    const end = path[step + 1];
    let t = 0;
    const animate = () => {
        if (t < 1) {
            const x = lerp(start[1].x, end[1].x, t);
            const y = lerp(start[1].y, end[1].y, t);
            set_pos([start[0], new Vector2(x, y)], t);
            t += spd * dt;
            requestAnimationFrame(animate);
        }
        else {
            animate_movement(ctx, w, h, set_pos, dt, path, spd, step + 1);
        }
    };
    animate();
};
//refactor this
const trace_path = (a, b) => {
    const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    const visited = Array.from({ length: room_height }, () => Array(room_width).fill(false));
    visited[a.y][a.x] = true;
    const qeue = [{ pos: a, dist: 0 }];
    const shifted = Array.from({ length: room_height }, () => Array(room_width).fill(false));
    while (qeue.length > 0) {
        const node = qeue.shift();
        if (node.pos.x === b.x && node.pos.y === b.y) {
            const path = [];
            let node = [[0, 0], b];
            while (node) {
                path.unshift(node);
                node = shifted[node[1].y][node[1].x];
            }
            return path;
        }
        for (const [x, y] of dirs) {
            const next = new Vector2(node.pos.x + x, node.pos.y + y);
            if (next.in_range(0, room_width - 1, 0, room_height - 1) && !visited[next.y][next.x]) {
                visited[next.y][next.x] = true;
                shifted[next.y][next.x] = [[x, y], node.pos];
                qeue.push({ pos: next, dist: node.dist + 1 });
            }
        }
    }
    return [];
};
function load_image(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = new Image();
        image.src = url;
        return new Promise((res, rej) => {
            image.onload = () => res(image);
            image.onerror = rej;
        });
    });
}
const draw_overlays = (ctx, cursor_grid, cursor_screen) => {
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.font = "10px serif";
    ctx.fillText(`cursor screen: ${cursor_screen.x} ${cursor_screen.y}`, 0, 50);
    ctx.fillText(`cursor grid: ${cursor_grid.x} ${cursor_grid.y}`, 0, 40);
    ctx.stroke();
};
function draw_walls_and_floor(ctx, sprites, camera) {
    for (let z = 0; z < room_height / 2; z += 1) {
        for (let x = 0; x < room_width; x += 1) {
            const tile = TILES[13];
            tile.position = new Vector3(x, -0.5, z);
            //ROOM.unshift({...tile});
            draw_sprite(ctx, sprites, tile.sprite, tile.position, camera);
        }
    }
    for (let z = 0; z < room_width / 2; z += 1) {
        for (let y = 0; y < room_height; y += 1) {
            const tile = TILES[12];
            tile.position = new Vector3(-0.5, y, z);
            //ROOM.unshift({...tile});
            draw_sprite(ctx, sprites, tile.sprite, tile.position, camera);
        }
    }
    for (let y = 0; y < room_height; y += 1) {
        for (let x = 0; x < room_width; x += 1) {
            const tile = TILES[14];
            tile.position = new Vector3(x, y, 0);
            //ROOM.unshift({...tile});
            draw_sprite(ctx, sprites, tile.sprite, tile.position, camera);
        }
    }
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const sprites = yield load_image("sprites.png");
    const canvas = document.getElementById("canvas");
    if (canvas == null) {
        throw new Error("Could not find canvas element");
    }
    const ctx = canvas.getContext("2d");
    if (ctx == null) {
        throw new Error("Canvas 2D context not supported");
    }
    const dimensions = ctx.canvas.parentElement.getBoundingClientRect();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const camera = new Camera(canvas.width * 0.5, canvas.height * 0.5);
    //draw_walls_and_floor(ctx, sprites, camera);
    let mdown = false;
    const cursor_screen_position = new Vector2(0, 0);
    const player_pos = new Vector3(0, 0, 0);
    let selected_obj;
    let is_selected_obj_snapped = false;
    let edit_mode = false;
    let redraw = true;
    canvas.addEventListener("pointermove", (evt) => {
        cursor_screen_position.x = evt.offsetX;
        cursor_screen_position.y = evt.offsetY;
    });
    canvas.addEventListener("pointerdown", (evt) => {
        if (evt.buttons === 1) {
            mdown = true;
        }
    });
    canvas.addEventListener("wheel", (evt) => {
        if (evt.deltaY < 0) {
            camera.scale = Math.min(camera.scale + 0.1, 4);
        }
        else {
            camera.scale = Math.max(camera.scale - 0.1, 0.4);
        }
    });
    canvas.addEventListener("pointerup", (_) => {
        mdown = false;
    });
    document.addEventListener("keypress", (evt) => {
        if (evt.key === "D") {
            DEBUG = !DEBUG;
        }
        else if (evt.key === "e") {
            edit_mode = !edit_mode;
        }
    });
    let prev_timestamp = 0;
    const draw = (timestamp) => {
        ctx.fillStyle = "#f1f1f1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ROOM.find(o => o.label === "player").position = player_pos.copy();
        //ROOM.find(o => o.label === "player")!.position.z = 1.3;
        let dt = (timestamp - prev_timestamp) / 1000;
        prev_timestamp = timestamp;
        let b = 0;
        for (let i = 0; i < TILES.length; i++) {
            const sprite = TILES[i].sprite;
            ctx.fillStyle = "#010101";
            ctx.beginPath();
            //console.log(b, i*32 *Math.ceil(TILES[i].xy_span.x));
            ctx.fillRect(b, dimensions.height * 0.5, Math.max(sprite.size.x, 32), Math.max(sprite.size.y, 32));
            const draw_start = new Vector2(b, dimensions.height * 0.5);
            const draw_l = draw_start.add2(Math.max(sprite.size.x, 32), 0);
            const draw_p = draw_start.add2(0, Math.max(sprite.size.y, 32));
            const draw_end = draw_start.add2(Math.max(sprite.size.x, 32), Math.max(sprite.size.y, 32));
            if (point_in_convex_quadrilateral(cursor_screen_position, [draw_start, draw_p, draw_end, draw_l])) {
                if (mdown) {
                    mdown = false;
                    selected_obj = TILES[i];
                    break;
                }
            }
            //if (point_in_convex_quadrilateral()) {
            //}
            ctx.stroke();
            ctx.drawImage(sprites, sprite.start.x, sprite.start.y, sprite.size.x, sprite.size.y, b, dimensions.height * 0.5, sprite.size.x, sprite.size.y);
            b += 32 * Math.ceil(TILES[i].xy_span.x) + 1;
        }
        ROOM = ROOM.sort((a, b) => {
            const a_depth = a.position.y + a.position.x + Math.round(a.position.z + 0.5);
            const b_depth = b.position.y + b.position.x + Math.round(b.position.z + 0.5);
            // Sort based on the depth
            return a_depth - b_depth; //const a_screen = camera.transform(a.position.add2(...a.xy_span.array(), a.z_span), a.sprite.offset);
            //const b_screen = camera.transform(b.position.add2(...b.xy_span.array(), b.z_span), b.sprite.offset);
            //
            //return (b_screen.y+b_screen.x)-(a_screen.y+a_screen.x);
            //const f =(Math.ceil(a.xy_span.x) + Math.ceil(a.position.x) +
            //Math.ceil(a.xy_span.y) + Math.ceil(a.position.y) +
            //Math.ceil(a.z_span) + Math.ceil(a.position.z)) - 
            //(Math.ceil(b.xy_span.x) + Math.ceil(b.position.x) +
            // Math.ceil(b.xy_span.y) + Math.ceil(b.position.y) + Math.ceil(b.z_span) + Math.ceil(b.position.z))
        });
        draw_walls_and_floor(ctx, sprites, camera);
        for (let i = 0; i < ROOM_SHAPE.length; i++) {
            let a = camera.transform(ROOM_SHAPE[i].add(new Vector3(0, 0, 0.2)));
            let a_b = camera.transform(ROOM_SHAPE[i].add(new Vector3(1, 0, 0.2)));
            let a_c = camera.transform(ROOM_SHAPE[i].add(new Vector3(0, 1, 0.2)));
            let a_d = camera.transform(ROOM_SHAPE[i].add(new Vector3(1, 1, 0.2)));
            object_outline_faces(ctx, [[a, a_c, a_d, a_b]], "#dab079");
        }
        for (const obj of ROOM) {
            draw_sprite(ctx, sprites, obj.sprite, obj.position, camera);
        }
        //if (redraw) {
        //	redraw = false;
        //}
        for (let idx = ROOM.length - 1; idx >= 0; idx -= 1) {
            const obj = ROOM[idx];
            const [[top, left, right], [bottom_grid, top_grid, left_grid, right_grid]] = object_get_visible_faces(obj, camera);
            if (DEBUG) {
                object_outline_faces(ctx, [left, right, top], "#fafa00");
            }
            if (selected_obj) {
                if (point_in_convex_quadrilateral(cursor_screen_position, left)) {
                    if (!obj.snapping.can_snap_left(selected_obj)) {
                        break;
                    }
                    // maybe recurse subdivions if the selected object doesnt fit
                    const subdivisions = convex_quadrilateral_subdivide(left_grid.map(v => v.xz()), new Vector2(obj.xy_span.x, obj.z_span), new Vector2(selected_obj.xy_span.x, selected_obj.z_span));
                    if (subdivisions.length === 0) {
                        selected_obj.position = bottom_grid[0].add2(0, obj.xy_span.y, 0);
                        is_selected_obj_snapped = true;
                    }
                    else {
                        const quad_grid = subdivisions.map(quad => quad.map(vertex => new Vector3(vertex.x, left_grid[0].y, vertex.y)));
                        const quad_screen = quad_grid.map(c => c.map(v => camera.transform(v)));
                        for (let i = 0; i < quad_screen.length; i++) {
                            const squad = quad_screen[i];
                            const gquad = quad_grid[i];
                            object_outline_faces(ctx, [squad]);
                            if (point_in_convex_quadrilateral(cursor_screen_position, squad)) {
                                selected_obj.position = bottom_grid[0].add(gquad[1].sub(bottom_grid[0]));
                                is_selected_obj_snapped = true;
                                break;
                            }
                        }
                    }
                    break;
                }
                if (point_in_convex_quadrilateral(cursor_screen_position, right)) {
                    if (!obj.snapping.can_snap_right(selected_obj)) {
                        break;
                    }
                    const subdivisions = convex_quadrilateral_subdivide(right_grid.map(v => v.yz()), new Vector2(obj.xy_span.y, obj.z_span), new Vector2(selected_obj.xy_span.y, selected_obj.z_span));
                    if (subdivisions.length === 0) {
                        selected_obj.position = bottom_grid[0].add2(obj.xy_span.x, 0, 0);
                        is_selected_obj_snapped = true;
                    }
                    else {
                        //lol
                        //translate by -2 because it starts from top left and goes +
                        const quad_grid = subdivisions.map(quad => quad.map(vertex => new Vector3(right_grid[0].x, vertex.x - (obj.xy_span.y), vertex.y)));
                        const quad_screen = quad_grid.map(c => c.map(v => camera.transform(v)));
                        for (let i = 0; i < quad_screen.length; i++) {
                            const squad = quad_screen[i];
                            const gquad = quad_grid[i];
                            object_outline_faces(ctx, [squad]);
                            if (point_in_convex_quadrilateral(cursor_screen_position, squad)) {
                                selected_obj.position = bottom_grid[0].add(gquad[1].sub(bottom_grid[0]));
                                is_selected_obj_snapped = true;
                                break;
                            }
                        }
                    }
                    break;
                }
                if (point_in_convex_quadrilateral(cursor_screen_position, top) && obj.can_stack) {
                    if (!obj.snapping.can_snap_top(selected_obj)) {
                        break;
                    }
                    const subdivisions = convex_quadrilateral_subdivide(right_grid.map(v => v.xy()), obj.xy_span, selected_obj.xy_span);
                    if (subdivisions.length === 0) {
                        selected_obj.position = bottom_grid[0].add2(0, 0, obj.z_span);
                        is_selected_obj_snapped = true;
                    }
                    else {
                        const quad_grid = subdivisions.map(quad => quad.map(vertex => new Vector3(vertex.x - (obj.xy_span.x), vertex.y, top_grid[0].z)));
                        const quad_screen = quad_grid.map(c => c.map(v => camera.transform(v)));
                        for (let i = 0; i < quad_screen.length; i++) {
                            const squad = quad_screen[i];
                            const gquad = quad_grid[i];
                            object_outline_faces(ctx, [squad]);
                            if (point_in_convex_quadrilateral(cursor_screen_position, squad)) {
                                selected_obj.position = bottom_grid[0].add(gquad[1].sub(bottom_grid[0]));
                                is_selected_obj_snapped = true;
                                break;
                            }
                        }
                    }
                    break;
                }
                is_selected_obj_snapped = false;
                selected_obj.position = new Vector3(0, 0, 0);
            }
        }
        if (!is_selected_obj_snapped) {
            for (let i = 0; i < ROOM_SHAPE.length; i++) {
                let a = camera.transform(ROOM_SHAPE[i]);
                let a_b = camera.transform(ROOM_SHAPE[i].add(new Vector3(1, 0, 0)));
                let a_c = camera.transform(ROOM_SHAPE[i].add(new Vector3(0, 1, 0)));
                let a_d = camera.transform(ROOM_SHAPE[i].add(new Vector3(1, 1, 0)));
                if (camera.reverse_transform(cursor_screen_position).toFloor(0).eq(ROOM_SHAPE[i].xy())) {
                    object_outline_faces(ctx, [[a, a_c, a_d, a_b]], "#f1f1f1");
                    if (selected_obj) {
                        selected_obj.position = ROOM_SHAPE[i].add2(0, 0, 0);
                        is_selected_obj_snapped = true;
                    }
                    break;
                }
            }
        }
        draw_overlays(ctx, camera.reverse_transform(cursor_screen_position).toFloor(0), cursor_screen_position);
        //console.log(camera.to_grid());
        if (edit_mode && selected_obj) {
            const [faces, faces_grid] = object_get_visible_faces(selected_obj, camera);
            if (is_selected_obj_snapped) {
                object_outline_faces(ctx, faces, "#360072");
                object_outline_faces(ctx, faces_grid.map((f) => f.map(v => camera.transform(v.mul(new Vector3(1, 1, 1))))), "#f1f1f1");
                if (mdown) {
                    console.log("placing at:", selected_obj.position);
                    mdown = false;
                    ROOM.push(Object.assign(Object.assign({}, selected_obj), { position: new Vector3(selected_obj.position.x, selected_obj.position.y, selected_obj.position.z === 0 ? 0.2 : selected_obj.position.z) }));
                }
            }
            else {
                object_outline_faces(ctx, faces_grid.map((f) => f.map(v => v.toScreen().add(cursor_screen_position))));
            }
        }
        else {
            if (mdown) {
                mdown = false;
                if (!is_animating) {
                    const path = trace_path(player_pos.xy(), camera.reverse_transform(cursor_screen_position).toFloor(0));
                    if (path.length > 0) {
                        animate_movement(ctx, canvas.width, canvas.height, (np, _) => {
                            const [dir, pos] = np;
                            player_pos.x = pos.x;
                            player_pos.y = pos.y;
                            let prev = camera.position;
                            //console.log();
                            //camera.position = camera.position.add(player_pos.mul(new Vector3(-0.5, -0.5, -0.5)).xy()); 
                        }, dt, path, 5, 0);
                    }
                }
            }
        }
        window.requestAnimationFrame(draw);
    };
    window.requestAnimationFrame((timestamp) => {
        prev_timestamp = timestamp;
        window.requestAnimationFrame(draw);
    });
}))();
