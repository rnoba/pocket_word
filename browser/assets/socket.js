import * as Base from "./base.js";
import * as Packet from "./packet.js";
const SERVER_PORT = 8080;
export function get_connection_state_string(socket) {
    switch (socket.readyState) {
        case WebSocket.OPEN: return "Open";
        case WebSocket.CLOSED: return "Closed";
        case WebSocket.CLOSING: return "Closing";
        case WebSocket.CONNECTING: return "Connecting";
        default: return "Unknown";
    }
}
let last_ping_sent = performance.now();
export function send_packet(socket, packet) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        if (packet.kind === Packet.PacketKind.PacketKind_Ping) {
            last_ping_sent = performance.now();
        }
        console.info(packet);
        console.time("sending packet");
        const data = Packet.packet_serialize(packet);
        console.timeEnd("sending packet");
        socket.send(data);
    }
}
const listeners = new Map();
export function add_listener(kind, fn) {
    const list = listeners.get(kind);
    if (!list) {
        listeners.set(kind, new Set([fn]));
        return;
    }
    list.add(fn);
}
export function remove_listener(kind, fn) {
    let ok = false;
    const list = listeners.get(kind);
    if (list) {
        ok = list.delete(fn);
    }
    return ok;
}
const hooks = new Set();
export function add_connection_hook(fn) {
    hooks.add(fn);
}
export function connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.hostname}:${SERVER_PORT}`);
    socket.binaryType = 'arraybuffer';
    socket.addEventListener("close", function (event) {
        console.log("WEBSOCKET CLOSE", event);
    });
    socket.addEventListener("error", function (event) {
        console.log("WEBSOCKET ERROR", event);
    });
    socket.addEventListener("message", function (event) {
        Base.assert(!!(event.data instanceof ArrayBuffer), "received non binary data from server");
        const packet = Packet.packet_deserialize(event.data);
        if (packet.kind == Packet.PacketKind.PacketKind_Pong) {
            console.info("ping(ms): ", performance.now() - last_ping_sent);
        }
        const dispatch = listeners.get(packet.kind);
        if (dispatch) {
            for (const fn of dispatch) {
                fn(packet);
            }
        }
    });
    socket.addEventListener("open", (event) => {
        console.log("WEBSOCKET OPEN", event);
        send_packet(socket, Packet.PingPacket);
        for (const fn of hooks) {
            fn();
        }
    });
    return socket;
}
