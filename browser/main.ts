import {TILE_HEIGHT, TILE_WIDTH, Vector2, Vector3} from "./base.js";
import SPRITES, { Sprite } from "./sprite.js";

type Object = {
	position: Vector3;
	sprite: Sprite;
	label: string;
	xy_span: Vector2;
	z_span: number;
	can_stack: boolean;
}

let DEBUG = false;

//TODO(pnf): !remove hard coded translations, add camera
//TODO(pnf): UI 
//TODO(png): check if snapped position is valid for specific objects
//TODO(png): subdivide grid 
//TODO(png): snapping rules
//
type SnappingRules = {
	// snap translation, the target object will 'decide' where the snapped object should be,
	// it will be a small translation, maybe half a tile MAX 
	can_snap_top: (to_test: Object) => boolean;
	can_snap_left: (to_test: Object) => boolean;
	can_snap_right: (to_test: Object) => boolean;
}

type ConvexQuadrilateral = [Vector2, Vector2, Vector2, Vector2];
type ConvexQuadrilateralGrid = [Vector3, Vector3, Vector3, Vector3];

let ROOM_SHAPE: Array<Vector3> = [];

const room_width = 10;
const room_height = 10;

function object_factory() {
}

function convex_quadrilateral_subdivide(quad: ConvexQuadrilateral, quad_span: Vector2, div_span: Vector2) {
	const ratio = div_span.divide(quad_span);

	if (ratio.x === 1 && ratio.y === 1) {
		return [];
	}

	if (ratio.x !== ratio.y) {

		if (ratio.x < ratio.y) {
			ratio.y = Math.floor(ratio.y) === 0 ? ratio.y : Math.floor(ratio.y);
		} else {
			ratio.x = Math.floor(ratio.x) === 0 ? ratio.x : Math.floor(ratio.x);
		}
	}

	const step = quad_span.mul(ratio); 

	const out: ConvexQuadrilateral[] = [];
	for (let y = 0; y < Math.floor(1/ratio.y); y++)
	{
		for (let x = 0; x < Math.floor(1/ratio.x); x++)
		{
			const top_left = quad[0].add2(x * step.x, -y * step.y);
			const bottom_left = top_left.add2(0, -step.y);
			const bottom_right = bottom_left.add2(step.x, 0);
			const top_right = top_left.add2(step.x, 0);
			out.push([top_left, bottom_left, bottom_right, top_right]);
		}
	}

	return out;
}

function point_in_convex_quadrilateral(p: Vector2, r: ConvexQuadrilateral) {
	const e1 = r[1].sub(r[0]);
	const e2 = r[2].sub(r[1]);
	const e3 = r[3].sub(r[2]);
	const e4 = r[0].sub(r[3]);

	const d1 = p.sub(r[0]).add2(0.3, 0.3);
	const d2 = p.sub(r[1]).add2(0.3, 0.3)
	const d3 = p.sub(r[2]).add2(0.3, 0.3);
	const d4 = p.sub(r[3]).add2(0.3, 0.3);

	const c1 = e1.cross(d1);
	const c2 = e2.cross(d2);
	const c3 = e3.cross(d3);
	const c4 = e4.cross(d4);

	return (c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0)||(c1 < 0 && c2 < 0 && c3 < 0 && c4 < 0);
}

function can_place_object(selected: Object, hovered: Object, cursor_pos: Vector2) {
}

// TODO(pnf): get rid of vector3
type ObjectGetVisibleFacesRet = [
	[ConvexQuadrilateral, ConvexQuadrilateral, ConvexQuadrilateral],
	[ConvexQuadrilateralGrid, ConvexQuadrilateralGrid, ConvexQuadrilateralGrid, ConvexQuadrilateralGrid]]

// return screen and grid coordinates of visible faces of 2d isometric object
function object_get_visible_faces(ctx: CanvasRenderingContext2D, obj: Object): ObjectGetVisibleFacesRet {
	const bottom_face = [
		obj.position,
		obj.position.add2(0, obj.xy_span.y, 0),
		obj.position.add2(obj.xy_span.x, obj.xy_span.y, 0),
		obj.position.add2(obj.xy_span.x, 0, 0),
	]

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
		top_face.map(v => v.toScreen().add2(ctx.canvas.width*0.5, ctx.canvas.height*0.5)) as ConvexQuadrilateral,
		left_face.map(v => v.toScreen().add2(ctx.canvas.width*0.5, ctx.canvas.height*0.5)) as ConvexQuadrilateral,
		right_face.map(v => v.toScreen().add2(ctx.canvas.width*0.5, ctx.canvas.height*0.5)) as ConvexQuadrilateral],
		[bottom_face as ConvexQuadrilateralGrid, top_face as ConvexQuadrilateralGrid, left_face as ConvexQuadrilateralGrid, right_face as ConvexQuadrilateralGrid]
	];
}

function object_outline_faces(ctx: CanvasRenderingContext2D, quad: ConvexQuadrilateral[], color?: string) {
	for (const face of quad) {
		const [a, b, c, d] = face;
		ctx.strokeStyle = "#0000FF"
		if (color !== undefined)
			ctx.strokeStyle = color 
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

const draw_sprite = (ctx: CanvasRenderingContext2D, sprite: Sprite, position: Vector3) => {
	const start_draw = position.toScreen()
		.add2(ctx.canvas.width*0.5, ctx.canvas.height*0.5)
		.add(sprite.offset).scale(1);
	const sprite_size = sprite.size.scale(1);

	ctx.drawImage(
		sprites,
		sprite.start.x,
		sprite.start.y,
		sprite.size.x,
		sprite.size.y,
		start_draw.x,
		start_draw.y,
		sprite_size.x,
		sprite_size.y,
	);
}

for (let x = 0; x < room_width; x++) {
	for (let y = 0; y < room_height; y++) {
		ROOM_SHAPE.push(new Vector3(x, y, 0));
	}
}

let ROOM: Array<Object> = [
	{
		position: new Vector3(0, 0, 0),
		sprite: SPRITES.cleiton[0],
		label: "player",
		can_stack: false,
		z_span: 2,
		xy_span: new Vector2(1, 1)
	},
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

let is_animating = false;
const animate_movement = (ctx:CanvasRenderingContext2D, w: number, h: number, set_pos: (new_pos: Vector2, t: number) => void, dt: number, path: Vector2[], spd: number, step: number) => {
	is_animating = true;
	if (step >= path.length - 1) {
		set_pos(path.pop()!, 1);
		is_animating = false;
		return;
	}
	const start = path[step];
	const end = path[step+1];

	let t = 0;
	const animate = () => {
		if (t < 1) {
			const x = lerp(start.x, end.x, t);
			const y = lerp(start.y, end.y, t);
			set_pos(new Vector2(x, y), t)
			t += spd * dt;
			requestAnimationFrame(animate);
		}
		else {
			animate_movement(ctx, w, h, set_pos, dt, path, spd, step + 1);
		}
	}
	animate();
}


const shortest_path = (a: Vector2, b: Vector2): Vector2[] => {
	const dirs: Array<[number, number]> = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];

	const visited: boolean[][] = Array.from({length: room_height}, () => Array(room_width).fill(false));
	visited[a.y][a.x] = true;

	const qeue: Array<{pos: Vector2, dist: number}> = [{pos: a, dist: 0}]

	const shifted: Vector2[][] = Array.from({length: room_height}, () => Array(room_width).fill(false));
	while (qeue.length > 0) {
		const node = qeue.shift()!;

		if (node.pos.x === b.x && node.pos.y === b.y) {
			const path: Vector2[] = [];
			let node: Vector2 | null = b;

			while (node) {
				path.unshift(node);
				node = shifted[node.y][node.x];
			}
			return path; 
		}

		for (const [x, y] of dirs) {
			const next: Vector2 = new Vector2(node.pos.x + x, node.pos.y + y)
			if (next.in_range(0, room_width-1, 0, room_height-1) && !visited[next.y][next.x]) {
				visited[next.y][next.x] = true;
				shifted[next.y][next.x] = node.pos;
				qeue.push({pos: next, dist: node.dist + 1});
			}
		}
	}
	return [];
}

const SPRITE_PATH = "./assets/sprites.png";
const sprites: HTMLImageElement = new Image();
sprites.src = SPRITE_PATH;

const draw_overlays = (ctx: CanvasRenderingContext2D, w: number, h: number, cursor_grid: Vector2, cursor_screen: Vector2) => {
	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.font = "10px serif";
	ctx.fillText(`cursor screen: ${cursor_screen.x} ${cursor_screen.y}`, 0, 50);
	ctx.fillText(`cursor grid: ${cursor_grid.x} ${cursor_grid.y}`, 0, 40);
	ctx.stroke();
}

(() => {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
	if (canvas == null) {
		throw new Error("Could not find canvas element");
	}
	const ctx = canvas.getContext("2d");
	if (ctx == null) {
		throw new Error("Canvas 2D context not supported");
	}
	const t = ctx.canvas.parentElement!.getBoundingClientRect()

	canvas.width	= t.width;
	canvas.height = t.height;

	let hovered_tile: Vector2 | null = null;
	let hovered_sprite: Object | null = null;
	let mdown = false;

	let scale = 1;
	const screen: Vector2 = new Vector2(0, 0);
	const m_screen: Vector2 = new Vector2(0, 0);
	const player_pos: Vector2 = new Vector2(0, 0);

	//CAMERA
	const camera = new Vector2(canvas.width, canvas.height).toGrid();
	console.log(camera);

	let is_selected_obj_snapped = false;

	const selected_obj = {
		position: new Vector3(0, 0, 0),
		sprite: SPRITES.floor[4], 
		label: "tile",
		z_span: 1,
		can_stack: true,
		xy_span: new Vector2(1, 1)
	};

	canvas.addEventListener("pointermove", (evt: PointerEvent) => {
		let _screen = new Vector2(evt.offsetX, evt.offsetY)
			.sub(new Vector2(canvas.width*0.5, canvas.height*0.5))
			.toGrid()
		screen.x = _screen.x;
		screen.y = _screen.y;
		m_screen.x = evt.offsetX;
		m_screen.y = evt.offsetY;
		hovered_tile = null;
		hovered_sprite = null;
	})

	let edit_mode = false;
	canvas.addEventListener("pointerdown", (evt: PointerEvent) => {
		if (evt.buttons === 1) {
			mdown = true;
		} else if (evt.buttons === 4) {
			edit_mode = !edit_mode;
		}
	})

	canvas.addEventListener("pointerup", (evt: PointerEvent) => {
		mdown = false;
	})

	document.addEventListener("keypress", (evt: KeyboardEvent) => {
		if (evt.key === "D") {
			DEBUG = !DEBUG;
		}
	})

	let prev_timestamp = 0;
	const draw = (timestamp: number) => { 
		ROOM.find(o => o.label === "player")!.position.x = player_pos.x;
		ROOM.find(o => o.label === "player")!.position.y = player_pos.y;

		let dt = (timestamp-prev_timestamp)/1000;
		prev_timestamp = timestamp;

		ctx.fillStyle = "#ffbf83"
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//ROOM = ROOM.sort((a, b) => (a.position.x + a.position.y + Math.floor(a.position.z))-(b.position.x + b.position.y + Math.floor(b.position.z)));
		ROOM = ROOM.sort((a, b) => (a.xy_span.x+a.position.x + a.xy_span.y+a.position.y + a.z_span+a.position.z)-(b.xy_span.x+b.position.x + b.xy_span.y+b.position.y + b.z_span+b.position.z));

		for (let i = 0; i < ROOM_SHAPE.length; i++) {
			let a = ROOM_SHAPE[i].toScreen();
			let a_b = ROOM_SHAPE[i].add(new Vector3(1, 0, 0)).toScreen();
			let a_c = ROOM_SHAPE[i].add(new Vector3(0, 1, 0)).toScreen();
			let a_d = ROOM_SHAPE[i].add(new Vector3(1, 1, 0)).toScreen();

			a.x += canvas.width*0.5;
			a.y += canvas.height*0.5;
			a_b.x += canvas.width*0.5;
			a_b.y += canvas.height*0.5;
			a_c.x += canvas.width*0.5;
			a_c.y += canvas.height*0.5;
			a_d.x += canvas.width*0.5;
			a_d.y += canvas.height*0.5;

			ctx.strokeStyle = "#dab079"
			ctx.beginPath();
			ctx.moveTo(...a.array());
			ctx.lineTo(...a_b.array());

			ctx.moveTo(...a_b.array());
			ctx.lineTo(...a_d.array());

			ctx.moveTo(...a_d.array());
			ctx.lineTo(...a_c.array());

			ctx.moveTo(...a_c.array());
			ctx.lineTo(...a.array());
			ctx.stroke();
		}


		for (const obj of ROOM) { 
			draw_sprite(ctx, obj.sprite, obj.position);
		}

		for (let idx = ROOM.length-1; idx >= 0; idx-=1) { 
			const obj = ROOM[idx];
			const [[top, left, right], [bottom_grid, top_grid, left_grid, right_grid]] = object_get_visible_faces(ctx, obj);
			if (DEBUG) {
				object_outline_faces(ctx, [left, right, top], "#fafa00"); 
			}

			if (point_in_convex_quadrilateral(m_screen, left)) {
				// maybe recurse subdivions if the selected object doesnt fit
				const subdivisions = convex_quadrilateral_subdivide(
					left_grid.map(v => v.xz()) as ConvexQuadrilateral,
					new Vector2(obj.xy_span.x, obj.z_span),
					new Vector2(selected_obj.xy_span.x, selected_obj.z_span),
				);

				if (subdivisions.length === 0) {
					selected_obj.position = bottom_grid[0].add2(0, obj.xy_span.y, 0);
					is_selected_obj_snapped = true;
				} else {
					const quad_grid = subdivisions.map(quad => quad.map(vertex => new Vector3(vertex.x, left_grid[0].y, vertex.y))) as ConvexQuadrilateralGrid[];
					const quad_screen = quad_grid.map(c => c.map(v => v.toScreen().add2(canvas.width*0.5, canvas.height*0.5))) as ConvexQuadrilateral[]

					for (let i = 0; i < quad_screen.length; i++) {
						const squad = quad_screen[i];
						const gquad = quad_grid[i];
						object_outline_faces(ctx, [squad]); 
						if (point_in_convex_quadrilateral(m_screen, squad)) {
							selected_obj.position = bottom_grid[0].add(gquad[1].sub(bottom_grid[0])); 
							is_selected_obj_snapped = true;
							break;
						}
					}
				}

				const [a, b, c, d] = left;
				ctx.strokeStyle = "#00FF00"
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
				break;
			}
			if (point_in_convex_quadrilateral(m_screen, right)) {
				const subdivisions = convex_quadrilateral_subdivide(
					right_grid.map(v => v.yz()) as ConvexQuadrilateral,
					new Vector2(obj.xy_span.y, obj.z_span),
					new Vector2(selected_obj.xy_span.y, selected_obj.z_span),
				);

				if (subdivisions.length === 0) {
					selected_obj.position = bottom_grid[0].add2(obj.xy_span.x, 0, 0);
					is_selected_obj_snapped = true;
				} else {
					//lol
					//translate by -2 because it starts from top left and goes +
					const quad_grid = subdivisions.map(quad => quad.map(vertex => new Vector3(right_grid[0].x, vertex.x-(obj.xy_span.y), vertex.y))) as ConvexQuadrilateralGrid[];
					const quad_screen = quad_grid.map(c => c.map(v => v.toScreen().add2(canvas.width*0.5, canvas.height*0.5))) as ConvexQuadrilateral[]

					for (let i = 0; i < quad_screen.length; i++) {
						const squad = quad_screen[i];
						const gquad = quad_grid[i];
						object_outline_faces(ctx, [squad]); 
						if (point_in_convex_quadrilateral(m_screen, squad)) {
							selected_obj.position = bottom_grid[0].add(gquad[1].sub(bottom_grid[0])); 
							is_selected_obj_snapped = true;
							break;
						}
					}
				}
				const [a, b, c, d] = right;
				ctx.strokeStyle = "#0000FF"
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
				break;
			}
			if (point_in_convex_quadrilateral(m_screen, top) && obj.can_stack) {
				const subdivisions = convex_quadrilateral_subdivide(
					right_grid.map(v => v.xy()) as ConvexQuadrilateral,
					obj.xy_span,
					selected_obj.xy_span,
				);
				if (subdivisions.length === 0) {
					selected_obj.position = bottom_grid[0].add2(0, 0, obj.z_span);
					is_selected_obj_snapped = true;
				} else {
					//lol
					const quad_grid = subdivisions.map(quad => quad.map(vertex => new Vector3(vertex.x-(obj.xy_span.x), vertex.y, top_grid[0].z))) as ConvexQuadrilateralGrid[];
					const quad_screen = quad_grid.map(c => c.map(v => v.toScreen().add2(canvas.width*0.5, canvas.height*0.5))) as ConvexQuadrilateral[]

					for (let i = 0; i < quad_screen.length; i++) {
						const squad = quad_screen[i];
						const gquad = quad_grid[i];
						object_outline_faces(ctx, [squad]); 
						if (point_in_convex_quadrilateral(m_screen, squad)) {
							object_outline_faces(ctx, [squad]); 
							selected_obj.position = bottom_grid[0].add(gquad[1].sub(bottom_grid[0])); 
							is_selected_obj_snapped = true;
							break;
						}
					}
				}
				const [a, b, c, d] = top;
				ctx.strokeStyle = "#FF0000"
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
				break;
			}

			is_selected_obj_snapped = false;
			selected_obj.position = new Vector3(0, 0, 0);
		}


		if (!is_selected_obj_snapped) {
			for (let i = 0; i < ROOM_SHAPE.length; i++) {
				let a = ROOM_SHAPE[i].toScreen();
				let a_b = ROOM_SHAPE[i].add(new Vector3(1, 0, 0)).toScreen();
				let a_c = ROOM_SHAPE[i].add(new Vector3(0, 1, 0)).toScreen();
				let a_d = ROOM_SHAPE[i].add(new Vector3(1, 1, 0)).toScreen();

				a.x += canvas.width*0.5;
				a.y += canvas.height*0.5;
				a_b.x += canvas.width*0.5;
				a_b.y += canvas.height*0.5;
				a_c.x += canvas.width*0.5;
				a_c.y += canvas.height*0.5;
				a_d.x += canvas.width*0.5;
				a_d.y += canvas.height*0.5;

				if (screen.toFloor(0).eq(ROOM_SHAPE[i].xy())) {
					ctx.strokeStyle = "#000000"
					ctx.beginPath();
					ctx.moveTo(...a.array());
					ctx.lineTo(...a_b.array());

					ctx.moveTo(...a_b.array());
					ctx.lineTo(...a_d.array());

					ctx.moveTo(...a_d.array());
					ctx.lineTo(...a_c.array());

					ctx.moveTo(...a_c.array());
					ctx.lineTo(...a.array());
					ctx.stroke();

					selected_obj.position = ROOM_SHAPE[i].add2(0, 0, 0);
					is_selected_obj_snapped = true;
					break;
				}
			}
		}

		draw_overlays(ctx, canvas.width, canvas.height, screen.toFloor(0), m_screen);

		if (edit_mode) {
			const selected_faces = object_get_visible_faces(ctx, selected_obj);
			if (is_selected_obj_snapped) {
				object_outline_faces(ctx, selected_faces[1].map((f) => f.map(f => f.toScreen().add2(canvas.width*0.5, canvas.height*0.5))) as [ConvexQuadrilateral, ConvexQuadrilateral, ConvexQuadrilateral], "#360072");
				object_outline_faces(ctx, selected_faces[1].map((f) => f.map(f => f.mul(new Vector3(1, 1, 0)).toScreen().add2(canvas.width*0.5, canvas.height*0.5))) as [ConvexQuadrilateral, ConvexQuadrilateral, ConvexQuadrilateral], "#f1f1f1");
				if (mdown) {
					console.log("placing at", selected_obj.position);
					mdown = false;
					ROOM.push({
						...selected_obj
					});
				}
			}
			else {
				object_outline_faces(ctx, selected_faces[1].map((f) => f.map(f => f.toScreen().add(m_screen))) as [ConvexQuadrilateral, ConvexQuadrilateral, ConvexQuadrilateral]);
			}
		}
		else {
			if (mdown) {
				mdown = false;
				if (!is_animating) {
					const path = shortest_path(player_pos, screen.toFloor(0));
					if (path.length > 0) {
						animate_movement(ctx, canvas.width, canvas.height, (np, t) => {
							player_pos.x = np.x;
							player_pos.y = np.y;
						}, dt, path, 5, 0);
					}
				}

			}
		}
		window.requestAnimationFrame(draw);
	}

	window.requestAnimationFrame((timestamp) => {
		prev_timestamp = timestamp;
		window.requestAnimationFrame(draw);
	});
})();
