import * as Sprite	from "./sprite.js";
import * as Base		from "./base.js";
import * as Input		from "./input.js";
import * as Ui		from "./ui_test.js";

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
	Base.set_global_ctx(ctx);

	const { width, height } = document.body.getBoundingClientRect();
	canvas.width	= width; 
	canvas.height = height;

	let current_frame = 0;
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
	const _Input = Input.init(); 
	Ui.set_input_instance(_Input);
	function draw(dt: number)
	{
		_Input.pool();
		Ui.FrameBegin(dt);
		for (let i = 0; i < 1; i++)
		{
			const id = `btn ${i}`;
			if (Ui.Button(id, Base.Rect(400 + i * 60, 300, 100, 40)))
			{
				console.log(id);
			}
		}
		Ui.FrameEnd();
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
