import * as Sprite	from "./sprite.js";
import * as Base		from "./base.js";
import * as Ui			from "./ui.js";
import * as Input		from "./input.js";

(async () => {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	if (canvas === null) {
		throw new Error("Could not find canvas element");
	}
	const ctx = canvas.getContext("2d");
	if (ctx === null) {
		throw new Error("Canvas 2D context not supported");
	}
	ctx.imageSmoothingEnabled = false;
	const { width, height } = document.body.getBoundingClientRect();
	canvas.width	= width; 
	canvas.height = height;
	//const camera: Base.Camera = {
	//	width,
	//	height,
	//	x: 0,
	//	y: 0,
	//	z: 0,
	//	word_position: Base.V2.Zero(),
	//	scaling: 1,
	//	is_locked: true,
	//};
	//
	//const w = Base.camera_transform_screen(camera, 0, 0, 0);
	//const s = Base.camera_transform_world(camera, w.x, w.y, 0);
	//console.log(w.array(), s.array())

	const ipt = Input.init();
	const ui = new Ui.UI(ctx, ipt); 

	const a:  Base.Rect = Base.Rect_new(10, 10, 200, 100);
	const b:  Base.Rect = Base.Rect_new(300, 10, 200, 100);
	const c:  Base.Rect = Base.Rect_new(10, 10, 200, 100);
	const d:  Base.Rect = Base.Rect_new(10, 10, 200, 100);

	ui.add_rect(Ui.UiRect_new(a, Base.RGBA_FULL_BLUE, true, Base.Rect_new(10, 10, 200, 20)));
	ui.add_rect(Ui.UiRect_new(b, Base.RGBA_FULL_RED, true));
	ui.add_rect(Ui.UiRect_new(c, Base.RGBA_FULL_GREEN, true));
	ui.add_rect(Ui.UiRect_new(d, Base.RGBA_FULL_BLUE, true));

	function draw(dt: number)
	{
		ipt.pool();
		ui.update();
	}

	let prev_timestamp = 0;
	const frame = (timestamp: number) => {
		const dt = (timestamp - prev_timestamp)/1000;
		prev_timestamp = timestamp;
		draw(dt);
		window.requestAnimationFrame(frame);
	}
	window.requestAnimationFrame((timestamp) => {
		prev_timestamp = timestamp;
		window.requestAnimationFrame(frame);
	});
})();
