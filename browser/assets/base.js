export const TW = 64;
export const TH = 32;
export class V2 {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static Zero() {
        return new V2(0, 0);
    }
    set(b) {
        this.x = b.x;
        this.y = b.y;
        return this;
    }
    copy() {
        return new V2(this.x, this.y);
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
    add(a, b) {
        this.x = this.x + a;
        this.y = this.y + b;
        return this;
    }
    sub(a, b) {
        this.x = this.x - a;
        this.y = this.y - b;
        return this;
    }
    cross(b) {
        return this.x * b.y - this.y * b.x;
    }
    dist(b) {
        b.sub(this.x, this.y);
        return b.len();
    }
    scale(scalar) {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
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
export function camera_transform_screen(camera, x, y, z, offset_x = 0, offset_y = 0) {
    const result = V2.Zero();
    result.x = x;
    result.y = y;
    result.screen(z)
        .add(offset_x, offset_y)
        .sub(camera.x, camera.y)
        .scale(camera.scaling)
        .add(camera.width * 0.5, camera.height * 0.5);
    return result;
}
export function camera_transform_world(camera, x, y, z, offset_x = 0, offset_y = 0) {
    const result = V2.Zero();
    result.x = x - camera.width * 0.5;
    result.y = y - camera.height * 0.5;
    result.scale(1 / camera.scaling)
        .add(camera.x, camera.y)
        .sub(offset_x, offset_y)
        .world(z);
    return result;
}
export function mod(n, m) {
    return (n % m + m) % m;
}
export function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
}
