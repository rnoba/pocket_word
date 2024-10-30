import { Vector2, Vector3 } from "base";
import { Sprite, SPRITES, Object } from "sprite";

class Grid {
	constructor(x: number, y: number, z: number) {
	}

	tile(obj: Object) {
		const end = obj.position.add(new Vector3(...obj.xy_span.array(), obj.z_span));
	}

	get_tile(x: number, y: number, z: number) {
	}

	get_column(x: number, y: number) {
	}

	get_plane(z: number) {
	}
}
