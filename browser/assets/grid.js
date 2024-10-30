import { Vector3 } from "base";
class Grid {
    constructor(x, y, z) {
    }
    tile(obj) {
        const end = obj.position.add(new Vector3(...obj.xy_span.array(), obj.z_span));
    }
    get_tile(x, y, z) {
    }
    get_column(x, y) {
    }
    get_plane(z) {
    }
}
