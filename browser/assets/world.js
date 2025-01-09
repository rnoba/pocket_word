import { camera_transform_screen, clamp, mod, TileHeight, TileWidth, Vector2 } from "./base.js";
import { get_object } from "./sprite.js";
export const ChunkX = 16;
export const ChunkY = 16;
export const ChunkZ = 16;
export const ChunkSize = ChunkX * ChunkY * ChunkZ;
export const ChunkXYSize = ChunkX * ChunkY;
function stupid_enqeue(qeue, memb) {
    let push = true;
    for (let i = 0; i < qeue.length; i++) {
        if (qeue[i] === memb) {
            push = false;
            break;
        }
    }
    if (push) {
        qeue.unshift(memb);
    }
}
const neighbours = [
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
    [0, -1, 0],
    [-1, 0, 0],
    [0, 0, -1],
    [-1, -1, -1],
    [-1, -1, 0],
    [1, 1, 0],
    [-1, -1, 1],
    [1, 1, -1],
    [-1, 0, -1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 1, -1],
    [1, -1, 1],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, 1, 1],
    [1, -1, -1],
    [0, -1, -1],
    [0, -1, 1],
    [0, 1, -1]
];
const PocketPresets = [
    [16, 16, 16],
    [32, 32, 96],
    [1024, 1024, 1024],
];
export function pocket_init(preset) {
    return {
        preset,
        chunks: new Map(),
        loading_chunks: [],
        view_distance: 4
    };
}
function chunk_init(x, y, z) {
    const chunk = {
        data: new Uint8Array(ChunkSize),
        visible: new Uint8Array(ChunkSize),
        sub_layers: new Map(),
        pos_hash: `${x}${y}${z}`,
        x, y, z,
        is_dirty: false,
        is_empty: true,
        is_ready: false,
        mesh: new ImageData(16 * 64, 16 * 64),
        off: new OffscreenCanvas(16 * 64, 16 * 64)
    };
    chunk.off_ctx = chunk.off.getContext("2d");
    return chunk;
}
function valid_position(x, y, z) {
    return (x >= 0 && y >= 0 && z >= 0) &&
        (x < ChunkX && y < ChunkY && z < ChunkZ);
}
const screen_pos = Vector2.zero();
function chunk_update_mesh(chunk) {
    const mesh_data = chunk.mesh.data;
    for (let i = 0; i < ChunkSize; i++) {
        const obj_id = chunk.data[i];
        if (obj_id === 0)
            continue;
        const cx = (i % ChunkX) >> 0;
        const cy = (i / ChunkX % ChunkY) >> 0;
        const cz = (i / ChunkXYSize) >> 0;
        const obj = get_object(obj_id);
        screen_pos.x = cx;
        screen_pos.y = cy;
        screen_pos.screen(cz)
            .add(512 - TileWidth / 2, 512 - TileHeight)
            .floor();
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 64; x++) {
                if (screen_pos.y + y < 0 ||
                    screen_pos.x + x < 0 ||
                    screen_pos.y + y >= chunk.mesh.height ||
                    screen_pos.x + x >= chunk.mesh.width) {
                    continue;
                }
                const sr = obj.data[(y * 64 + x) * 4];
                const sg = obj.data[(y * 64 + x) * 4 + 1];
                const sb = obj.data[(y * 64 + x) * 4 + 2];
                const sa = obj.data[(y * 64 + x) * 4 + 3] / 255;
                if (sa <= 0)
                    continue;
                const idx = ((screen_pos.y + y) * chunk.mesh.width + (screen_pos.x + x)) * 4;
                const dr = mesh_data[idx];
                const dg = mesh_data[idx + 1];
                const db = mesh_data[idx + 2];
                const da = mesh_data[idx + 3] / 255;
                const a = da + sa * (1 - da);
                const r = (dr * da * (1 - sa) + sr * sa) / a;
                const g = (dg * da * (1 - sa) + sg * sa) / a;
                const b = (db * da * (1 - sa) + sb * sa) / a;
                mesh_data[idx] = clamp(0, 255, r);
                mesh_data[idx + 1] = clamp(0, 255, g);
                mesh_data[idx + 2] = clamp(0, 255, b);
                mesh_data[idx + 3] = a * 255;
            }
        }
    }
    // thsi is bad but its the only way of properly blending ImageData into the main canvas without overwriting stuff
    // (other methods are way slower)...
    chunk.off_ctx.putImageData(chunk.mesh, 0, 0);
    chunk.mesh.data.fill(0);
    chunk.is_dirty = false;
}
export function world_load_chunks(world, x, y, z) {
    let loaded = false;
    const px = Math.floor(x / ChunkX);
    const py = Math.floor(y / ChunkY);
    const pz = Math.floor(z / ChunkZ);
    const preset = PocketPresets[world.preset];
    for (let dz = world.view_distance; dz >= -world.view_distance; dz--) {
        for (let dy = -world.view_distance; dy <= world.view_distance; dy++) {
            for (let dx = -world.view_distance; dx <= world.view_distance; dx++) {
                const cx = px + dx;
                const cy = py + dy;
                const cz = pz + dz;
                if ((cx < 0 || cx >= (preset[0] / ChunkX)) ||
                    (cy < 0 || cy >= (preset[1] / ChunkY)) ||
                    (cz < 0 || cz >= (preset[2] / ChunkZ))) {
                    continue;
                }
                const cdx = cx - px;
                const cdy = cy - py;
                const cdz = cz - pz;
                const len = cdx * cdx + cdy * cdy + cdz * cdz;
                if (len < world.view_distance * world.view_distance) {
                    const chunk_hash = `${cx}${cy}${cz}`;
                    if (!world.chunks.has(chunk_hash)) {
                        const chunk = chunk_init(cx, cy, cz);
                        world.chunks.set(chunk_hash, chunk);
                        stupid_enqeue(world.loading_chunks, chunk);
                        console.log(`loading: ${chunk.pos_hash}`);
                        loaded = true;
                    }
                }
            }
        }
    }
    const chunks = [...world.chunks.values()];
    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];
        const cx = px - chunk.x;
        const cy = py - chunk.y;
        const cz = pz - chunk.z;
        const len = cx * cx + cy * cy + cz * cz;
        if (len >= world.view_distance * world.view_distance) {
            console.log(`unloading: ${chunk.pos_hash}`);
            world.chunks.delete(chunk.pos_hash);
        }
    }
    return loaded;
}
export function world_load(world) {
    while (world.loading_chunks.length > 0) {
        const chunk = world.loading_chunks.shift();
        if (chunk.z === 0) {
            chunk.data.fill(1, 0, ChunkXYSize);
            chunk.is_empty = false;
        }
        if (!chunk.is_empty) {
            chunk_update_mesh(chunk);
        }
        chunk.is_ready = true;
    }
}
const chunk_pos = Vector2.zero();
export function world_draw(rend, world) {
    world_load(world);
    rend.main_ctx.clearRect(0, 0, rend.camera.dim.width, rend.camera.dim.height);
    const chunks = [...world.chunks.values()];
    for (const chunk of chunks) {
        if (chunk.is_dirty && chunk.is_ready && !chunk.is_empty) {
            chunk_update_mesh(chunk);
        }
        camera_transform_screen(rend.camera, chunk.x * ChunkX, chunk.y * ChunkY, chunk.z * ChunkZ, chunk_pos);
        chunk_pos.sub(chunk.mesh.width / 2, chunk.mesh.height / 2);
        rend.main_ctx.drawImage(chunk.off, chunk_pos.x, chunk_pos.y);
    }
}
export function world_get_chunk(world, wx, wy, wz) {
    const chunk_x = Math.floor(wx / ChunkX);
    const chunk_y = Math.floor(wy / ChunkY);
    const chunk_z = Math.floor(wz / ChunkZ);
    const hash = `${chunk_x}${chunk_y}${chunk_z}`;
    return world.chunks.get(hash) || null;
}
export function world_get_obj(world, x, y, z) {
    const chunk = world_get_chunk(world, x, y, z);
    let id = 0;
    if (chunk) {
        const cx = mod(x, ChunkX);
        const cy = mod(y, ChunkY);
        const cz = mod(z, ChunkY);
        const idx = (cz * ChunkX * ChunkY) + (cy * ChunkX) + cx;
        id = chunk.data[idx];
    }
    return id;
}
export function world_remove_obj(world, x, y, z) {
    const chunk = world_get_chunk(world, x, y, z);
    if (chunk) {
        const cx = mod(x, ChunkX);
        const cy = mod(y, ChunkY);
        const cz = mod(z, ChunkY);
        const idx = (cz * ChunkX * ChunkY) + (cy * ChunkX) + cx;
        chunk.data[idx] = 0;
        chunk.is_dirty = true;
    }
}
export function world_set_obj(world, x, y, z, obj_id) {
    const chunk = world_get_chunk(world, x, y, z);
    console.log("raw: ", x, y, z);
    if (chunk) {
        const cx = mod(x, ChunkX);
        const cy = mod(y, ChunkY);
        const cz = mod(z, ChunkY);
        const idx = (cz * ChunkX * ChunkY) + (cy * ChunkX) + cx;
        chunk.data[idx] = obj_id;
        chunk.visible[idx] = 1;
        chunk.is_dirty = true;
    }
}
