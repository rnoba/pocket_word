import * as Sprite	from "./sprite.js";
import * as Base		from "./base.js";
import * as Input		from "./input.js";
import * as Ui			from "./ui.js";

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
	await Base.load_fonts();
	const sprites = await Sprite.load();
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
	const ipt = Input.init(); 
	Ui.SetInputInstance(ipt);
	function draw(dt: number)
	{
		ipt.pool();

		//TODO(rnoba); remove this
		ctx!.clearRect(0, 0, 1440, 900);

		Ui.FrameBegin(dt);
		//if (Ui.InventoryIsOpen())
		//{
		//Ui.DrawInventory(sprites[0] as ImageBitmap[])
		//}
		Ui.DrawSpriteLoader(sprites[1] as ImageBitmap);
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
