import * as Base		from "./base.js"
import * as Packet	from "./packet.js"

const SERVER_PORT = 8080;


export function get_connection_state_string(socket: WebSocket)
{
	switch(socket.readyState)
	{
		case WebSocket.OPEN: return "Open";
		case WebSocket.CLOSED: return "Closed";
		case WebSocket.CLOSING: return "Closing";
		case WebSocket.CONNECTING: return "Connecting";
		default: return "";
	}
}

export function send_packet(socket: WebSocket, packet: Packet.Packet)
{
	if (socket && socket.readyState === WebSocket.OPEN)
	{
		console.warn(`sending packet: ${packet.kind}`);
		const data = Packet.packet_serialize(packet); 
		socket.send(data);
	}
}

export function connect()
{
	const protocol	= window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const socket		= new WebSocket(`${protocol}//${window.location.hostname}:${SERVER_PORT}`);

	//const count = new Performance()
	let ping_sent = performance.now();

	socket.binaryType = 'arraybuffer';
	socket.addEventListener("close", function (event) {
		console.log("WEBSOCKET CLOSE", event)
	});
	socket.addEventListener("error", function(event) {
		console.log("WEBSOCKET ERROR", event)
	});
	socket.addEventListener("message", function (event) {
		Base.assert(!!(event.data instanceof ArrayBuffer), "received non binary data from server");
		const packet = Packet.packet_deserialize(event.data);
		console.log(performance.now() - ping_sent);
	});
	socket.addEventListener("open", (event) => {
		console.log("WEBSOCKET OPEN", event)

		const packet	= Packet.packet_ping_make();
		const data		= Packet.packet_serialize(packet); 
		socket.send(data);

		ping_sent = performance.now();
	});

	return socket;
}
