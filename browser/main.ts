import * as Sprite	from "./sprite.js";
import * as Base		from "./base.js";
import * as Input		from "./input.js";
import * as Ui			from "./ui.js";
import * as WS			from "./socket.js";
import * as Packet	from "./packet.js";
import * as Editor from "./editor.js";

function user_is_anonymous(user_id: number)
{
	return user_id === Packet.ANONYMOUS_ID;
}

function user_is_offline(user: User)
{
	return user.socket === null; 
}

type InventoryItem = {
	item_id:	number;
	amount:		number;
}

type Inventory = {
	items: InventoryItem[];
}

type User = {
	user_id:		number;
	username:		string;
	socket:			WebSocket | null;
	inventory:	Inventory;
	created_at: string;
}

(async () => {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	if (canvas === null) {
		throw new Error("Could not find canvas element");
	}
	const ctx = canvas.getContext("2d");
	if (ctx === null) {
		throw new Error("Canvas 2D context not supported");
	}
	//ctx.imageSmoothingEnabled = false;
	Base.set_global_ctx(ctx);

	const { width, height } = document.body.getBoundingClientRect();
	canvas.width	= width; 
	canvas.height = height; 

	await Base.load_fonts();
	const sprites = await Sprite.load();
	const camera: Base.Camera = {
		width,
		height,
		x: 0,
		y: 0,
		z: 0,
		world_position: Base.V2.Zero(),
		zoom: 1,
		is_locked: true,
	};

	const socket = WS.connect();
	Input.init(); 
	//Ui.ui_init(socket);
	const p = Packet.packet_authentication_client_make("rnoba", "batatinha");
	//Ui.Init(socket);

	WS.add_listener(Packet.PacketKind.PacketKind_Pong, function (packet: Packet.Packet) {
		setTimeout(() => {
			WS.send_packet(socket, Packet.PingPacket);
		}, 10000);
	});

	WS.add_listener(Packet.PacketKind.PacketKind_Ok, function (packet: Packet.Packet) {
		const payload = packet.payload as Packet.PacketOk;
		console.log("OK: ", payload.ok, Packet.packet_kind_to_string[payload.ctx]);
	});

	WS.add_listener(Packet.PacketKind.PacketKind_AuthenticationServer, function (packet: Packet.Packet) {
		const payload = packet.payload as Packet.PacketAuthenticationServer;
		console.log(packet.payload); 
	});

	Editor.editor_set_size(width, height);
	ctx!.fillStyle = "#FFFFFF"
	function draw(dt: number)
	{
		Input.pool();
		const evt = Input.consume_specific<Input.ResizeEvent>(Input.IptEventKind.Resize);
		if (evt)
		{
			const { width, height } = evt.payload;
			canvas.width = innerWidth; canvas.height = innerHeight;
			Editor.editor_set_size(width, height);
		}

		//Ui.ui_frame_begin(dt, canvas.width, canvas.height);
		//	Ui.ui_draw_inventory(sprites);
		//Ui.ui_frame_end();
		Editor.editor(dt, sprites);
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
