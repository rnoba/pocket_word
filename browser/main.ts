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
	const ui = new Ui.UI(ctx); 

	let dragging = false;
	let drag_start = Base.V2.Zero();
	let drag_pivot: Base.V2 | null = null; 

	const rect:  Base.Rect = Base.Rect_new(10, 10, 200, 100);
	const color: Base.RGBA = Base.RGBA(1, 0, 0, 1);

	function draw(dt: number)
	{
		ctx!.clearRect(0, 0, canvas.width, canvas.height);
		ipt.pool();
		ui.update();

		if (Base.point_in_rect(ipt.cursor.position, rect))
		{
			if (ipt.is_down(Input.MBttn.M_LEFT))
			{
				if (!drag_pivot)
				{
					drag_pivot = ipt.cursor.position.copy();
				}
				drag_start.set(ipt.cursor.position).sub(rect.position);
				dragging = true;
			}
		}

		if (dragging)
		{
			if (!ipt.is_down(Input.MBttn.M_LEFT))
			{
				dragging		= false;
				drag_pivot	= null;
			}
			else
			{
				console.log(drag_pivot, drag_start);
				const new_position = ipt.cursor.position.clone().sub(drag_start);
				rect.position.set(new_position);
			}
		}
		ui.draw_rect(rect, color);
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
