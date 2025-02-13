export const TW = 64;
export const TH = 32;
export let GlobalContext = null;
export function set_global_ctx(ctx) {
    GlobalContext = ctx;
}
export var Directions;
(function (Directions) {
    Directions[Directions["N"] = 0] = "N";
    Directions[Directions["NW"] = 1] = "NW";
    Directions[Directions["W"] = 2] = "W";
    Directions[Directions["SW"] = 3] = "SW";
    Directions[Directions["S"] = 4] = "S";
    Directions[Directions["SE"] = 5] = "SE";
    Directions[Directions["E"] = 6] = "E";
    Directions[Directions["NE"] = 7] = "NE";
})(Directions || (Directions = {}));
export class V2 {
    x;
    y;
    w;
    constructor(x, y, w = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
    }
    static Zero() {
        return new V2(0, 0);
    }
    static New(x, y, w = 0) {
        return new V2(x, y, w);
    }
    clone() {
        return new V2(this.x, this.y, this.w);
    }
    set(b) {
        this.x = b.x;
        this.y = b.y;
        this.w = b.w;
        return this;
    }
    setn(x, y, w = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        return this;
    }
    len() {
        const l = this.x * this.x + this.y * this.y;
        return Math.sqrt(l);
    }
    len2() {
        return this.x * this.x + this.y * this.y;
    }
    div(b) {
        if (b.x !== 0 && b.y !== 0) {
            this.x = this.x / b.x;
            this.y = this.y / b.y;
        }
        return this;
    }
    norm() {
        const l = this.len();
        if (l !== 0) {
            this.x = this.x / l;
            this.y = this.y / l;
        }
        return this;
    }
    translate(b) {
        this.x = this.x + b.x;
        this.y = this.y + b.y;
        return this;
    }
    add2(a, b) {
        this.x = this.x + a;
        this.y = this.y + b;
        return this;
    }
    sub2(a, b) {
        this.x = this.x - a;
        this.y = this.y - b;
        return this;
    }
    add(b) {
        this.x = this.x + b.x;
        this.y = this.y + b.y;
        return this;
    }
    sub(b) {
        this.x = this.x - b.x;
        this.y = this.y - b.y;
        return this;
    }
    cross(b) {
        return this.x * b.y - this.y * b.x;
    }
    dist(b) {
        b.sub2(this.x, this.y);
        return b.len();
    }
    scale(scalar) {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }
    floor() {
        this.x = Floor(this.x);
        this.y = Floor(this.y);
        return this;
    }
    round() {
        this.x = Round(this.x);
        this.y = Round(this.y);
        return this;
    }
    world(z = 0) {
        const prev_x = this.x;
        this.x = this.x / TW + this.y / TH;
        this.y = this.y / TH - prev_x / TW + z * TH;
        return this;
    }
    screen(z = 0) {
        const prev_x = this.x;
        this.x = (this.x - this.y) * (TW / 2);
        this.y = (prev_x + this.y) * (TH / 2) - z * TH;
        return this;
    }
    array() {
        return [this.x, this.y];
    }
}
export function RGBA(r, g, b, a = 1.0) {
    const r_norm = Clamp(r, 0, 255);
    const g_norm = Clamp(g, 0, 255);
    const b_norm = Clamp(b, 0, 255);
    const color = {
        r: r_norm,
        g: g_norm,
        b: b_norm,
        a: Math.max(Math.min(a, 1), 0),
    };
    return (color);
}
export const RGBA_FULL_RED = RGBA(255, 0, 0);
export const RGBA_FULL_TRANSPARENT = RGBA(0, 0, 0, 0);
export const RGBA_FULL_GREEN = RGBA(0, 255, 0);
export const RGBA_FULL_BLUE = RGBA(0, 0, 255);
export const RGBA_FULL_BLACK = RGBA(0, 0, 0);
export const RGBA_FULL_WHITE = RGBA(255, 255, 255);
const HEX = "0123456789ABCDEF";
function hex_get_place(c) {
    let i = 0;
    for (i; i < 15; i += 1) {
        if (HEX[i] === c.toUpperCase())
            break;
    }
    return i;
}
export function Hex(color) {
    assert((color.length === 7 || color.length === 9) && color[0] === '#');
    const R = hex_get_place(color[2]) + hex_get_place(color[1]) * 16;
    const G = hex_get_place(color[4]) + hex_get_place(color[3]) * 16;
    const B = hex_get_place(color[6]) + hex_get_place(color[5]) * 16;
    let A = 255;
    if (color.length === 9) {
        A = hex_get_place(color[8]) + hex_get_place(color[7]) * 16;
    }
    return RGBA(R, G, B, A / 255);
}
function ntox(n) {
    let r = "";
    do {
        r = HEX[n % 16] + r;
        n >>>= 4;
    } while (n > 0);
    return (r.padStart(2, "0"));
}
export function RGBA_to_hex_string(color) {
    return `#${ntox(color.r)}${ntox(color.g)}${ntox(color.b)}${ntox(color.a * 255)}`;
}
export function RGBA_to_css_string(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}
export function camera_transform_screen(camera, x, y, z, out, offset_x = 0, offset_y = 0) {
    out.x = x;
    out.y = y;
    out
        .screen(z)
        .add2(offset_x, offset_y)
        .sub2(camera.x, camera.y)
        .scale(camera.zoom)
        .add2(camera.width * 0.5, camera.height * 0.5);
    return out;
}
export function camera_transform_world(camera, x, y, z, out, offset_x = 0, offset_y = 0) {
    out.x = x - camera.width * 0.5;
    out.y = y - camera.height * 0.5;
    out.scale(1 / camera.zoom)
        .add2(camera.x, camera.y)
        .sub2(offset_x, offset_y)
        .world(z);
    return out;
}
export function mod(n, m) {
    return (n % m + m) % m;
}
export function point_in_rect_ui(x, y, rect) {
    const rect_end_x = rect.pos[0] + rect.size[0];
    const rect_end_y = rect.pos[1] + rect.size[1];
    if ((x < rect.pos[0] ||
        y < rect.pos[1]) ||
        (x > rect_end_x ||
            y > rect_end_y)) {
        return (false);
    }
    return (true);
}
export function point_in_rect(point, rect) {
    const rect_end_x = rect.position.x + rect.width;
    const rect_end_y = rect.position.y + rect.height;
    if ((point.x < rect.position.x ||
        point.y < rect.position.y) ||
        (point.x > rect_end_x ||
            point.y > rect_end_y)) {
        return (false);
    }
    return (true);
}
export function Rect(x, y, w, h) {
    return {
        position: V2.New(x, y),
        width: w,
        height: h
    };
}
export function RGB_Darken(color, amt) {
    const out = RGBA(0, 0, 0, 1);
    amt = Clamp(amt, 0, 1);
    out.r = color.r * (1.0 - amt);
    out.g = color.g * (1.0 - amt);
    out.b = color.b * (1.0 - amt);
    return (out);
}
export function RGB_Lighten(color, amt) {
    const out = RGBA(0, 0, 0, 1);
    amt = Clamp(amt, 0, 1);
    out.r = color.r * (1.0 + amt) & 0xFF;
    out.g = color.g * (1.0 + amt) & 0xFF;
    out.b = color.b * (1.0 + amt) & 0xFF;
    return (out);
}
export function assert(p, msg = "") {
    if (!p) {
        throw new Error(`assertion failed ${msg}`);
    }
}
export function Floor(n) {
    return (n >> 0);
}
export function Round(n) {
    let sign = n < 0 ? -1 : 1;
    return (sign * Floor(Math.abs(n) + 0.5));
}
export function Clamp(value, min, max) {
    return (Math.min(Math.max(value, min), max));
}
export const u640 = 0; //u64(0);
const cache = new Map();
const InitialFNV = 2166136261;
const FNVMultiple = 16777619;
export function hash_string(str, seed = 0) {
    const cached = cache.get(str);
    if (cached) {
        return cached;
    }
    let hash = InitialFNV * seed;
    for (let i = 0; i < str.length; i++) {
        hash = hash ^ str.charCodeAt(i);
        hash = (hash * FNVMultiple) & 0xffffffffffff;
    }
    cache.set(str, hash);
    return hash;
}
export function has_flag(value, flag) {
    return (value & flag) === flag;
}
export async function load_fonts() {
    const fonts = [
        { family: "PixelGameExtrude", file: "./Pixel_Game_Extrude.otf" },
        { family: "PixelGame", file: "./Pixel_Game.otf" },
        { family: "Gameday", file: "./gameday_regular.otf" },
        { family: "GamesStudios", file: "./games_studios_regular.otf" },
        { family: "Monitorica", file: "./Fonts/Monitorica/Monitorica-It.ttf" },
        { family: "Repo", file: "./Fonts/Repo/Repo-Bold.otf" }
    ];
    for (const { family, file } of fonts) {
        const font_face = new FontFace(family, `url(${file})`);
        try {
            const _font = await font_face.load();
            document.fonts.add(_font);
        }
        catch (err) {
            console.warn("could not load font: ", family, file);
        }
    }
}
export function Fixed(float, places) {
    return (Number((Round(float * (10 * places)) / (10 * places)).toFixed(places)));
}
export function stack_empty() {
    return {
        value: null,
        top: null,
        free: null,
        pop: false
    };
}
export function stack_init(v) {
    return {
        value: null,
        top: { value: v, next: null },
        free: null,
        pop: false
    };
}
export function stack_node_empty() {
    return {
        value: null,
        next: null
    };
}
export function stack_node_init(v) {
    return {
        value: v,
        next: null
    };
}
export function stack_pop(stack) {
    const node = stack.top;
    if (node != null) {
        stack.top = stack.top.next;
        node.next = stack.free;
        stack.free = node;
    }
    stack.pop = false;
    return (node);
}
export function stack_push_set_pop(stack, next) {
    let node = stack.free;
    if (node !== null) {
        stack.free = stack.free.next;
    }
    else {
        node = stack_node_empty();
    }
    const prev_top = stack.top;
    node.value = next;
    node.next = stack.top;
    stack.top = node;
    stack.pop = true;
    return (prev_top);
}
export function stack_remove_node(stack, rnode) {
    if (rnode === stack.top) {
        stack_pop(stack);
        return;
    }
    let head = stack.top;
    for (; head !== null && head.next !== rnode; head = head.next) { }
    if (head && head.next === rnode) {
        head.next = rnode.next;
    }
}
export function stack_it(stack, fn) {
    let idx = 0;
    for (let node = stack.top; node !== null; idx += 1) {
        const next = node.next;
        fn(node.value, idx, node);
        node = next;
    }
}
export function stack_push(stack, next) {
    let node = stack.free;
    if (node !== null) {
        stack.free = stack.free.next;
    }
    else {
        node = stack_node_empty();
    }
    const prev_top = stack.top;
    node.value = next;
    node.next = stack.top;
    stack.top = node;
    stack.pop = false;
    return (prev_top);
}
export function dll_insert_pos(pointers, pos, new_node) {
    if (pointers.first === null) {
        // no nodes in in the list
        // set pointers.first and pointers.last
        pointers.first = pointers.last = new_node;
        new_node.next = null;
        new_node.prev = null;
    }
    else if (pos === null) {
        // insert node at beginning
        new_node.next = pointers.first;
        pointers.first.prev = new_node;
        pointers.first = new_node;
        new_node.prev = null;
    }
    else if (pos === pointers.last) {
        // insert node at end
        pointers.last.next = new_node;
        new_node.prev = pointers.last;
        pointers.last = new_node;
        new_node.next = null;
    }
    else {
        // insert node at middle 
        if (pos.next !== null) {
            pos.next.prev = new_node;
        }
        new_node.next = pos.next;
        pos.next = new_node;
        new_node.prev = pos;
    }
}
export function dll_insert_back(pointers, new_node) {
    dll_insert_pos(pointers, pointers.last, new_node);
}
export function rect_clip(clip, target) {
    const tx0 = target.pos[0];
    const ty0 = target.pos[1];
    const tx1 = tx0 + target.size[0];
    const ty1 = ty0 + target.size[1];
    const cx0 = clip.pos[0];
    const cy0 = clip.pos[1];
    const cx1 = cx0 + clip.size[0];
    const cy1 = cy0 + clip.size[1];
    if (point_in_rect_ui(cx0, cy0, target) &&
        point_in_rect_ui(cx1, cy1, target)) {
        return clip;
    }
    const ix0 = Math.max(tx0, cx0);
    const iy0 = Math.max(ty0, cy0);
    const ix1 = Math.min(tx1, cx1);
    const iy1 = Math.min(ty1, cy1);
    const out = { size: [0, 0], pos: [0, 0] };
    if (ix1 > ix0 && iy1 > iy0) {
        out.pos = [ix0, iy0];
        out.size = [ix1 - ix0, iy1 - iy0];
    }
    return (out);
}
export function align_pow2(a, b) {
    a = Floor(a);
    b = Floor(b);
    return (a + b - 1) & ~(b - 1);
}
export function face_to_screen(camera, face, tw = 0, th = 0) {
    return face.map((v) => camera_transform_screen(camera, v.x + tw, v.y + th, v.w, V2.Zero()));
}
const d1 = V2.Zero();
const d2 = V2.Zero();
const d3 = V2.Zero();
const d4 = V2.Zero();
const e1 = V2.Zero();
const e2 = V2.Zero();
const e3 = V2.Zero();
const e4 = V2.Zero();
export function point_in_convex_quadrilateral(point, face) {
    e1.set(face[1]).sub(face[0]);
    e2.set(face[2]).sub(face[1]);
    e3.set(face[3]).sub(face[2]);
    e4.set(face[0]).sub(face[3]);
    d1.set(point);
    d2.set(point);
    d3.set(point);
    d4.set(point);
    d1.sub(face[0]);
    d2.sub(face[1]);
    d3.sub(face[2]);
    d4.sub(face[3]);
    const c1 = e1.cross(d1);
    const c2 = e2.cross(d2);
    const c3 = e3.cross(d3);
    const c4 = e4.cross(d4);
    return (c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0) ||
        (c1 < 0 && c2 < 0 && c3 < 0 && c4 < 0);
}
//lol
export function Ptr(v = null) {
    return { value: v };
}
export function PtrIsNil(v) {
    return v.value === null;
}
