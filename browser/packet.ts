import * as Base from "./base.js";

const SERVER_ID			= 1;
const ANONYMOUS_ID	= 0;

function write_u64(view: DataView, offset: number, value: number)
{
	const low		= value & 0xFFFFFFFF;
	const high	= value / 2 ** 32; 
	view.setUint32(offset, low, true);
	view.setUint32(offset + 4, high, true);
	return offset + 8;
}

function get_u64(view: DataView, offset: number)
{
	const low		= view.getUint32(offset, true); 
	const high	= view.getUint32(offset + 4, true); 
	const value = (high * 2 ** 32) + low;
	return value;
}

function write_u32(view: DataView, offset: number, value: number)
{
	view.setUint32(offset, value, true);
	return offset + 4;
}

function write_u16(view: DataView, offset: number, value: number)
{
	view.setUint16(offset, value, true);
	return offset + 2;
}

function write_u8(view: DataView, offset: number, value: number)
{
	view.setUint8(offset, value);
	return offset + 1;
}

function write_i64(view: DataView, offset: number, value: number)
{
	const low		= value & 0xFFFFFFFF;
	const high	= value / 2 ** 32; 
	view.setInt32(offset, low, true);
	view.setInt32(offset + 4, high, true);
	return offset + 8;
}

function write_i32(view: DataView, offset: number, value: number)
{
	view.setInt32(offset, value, true);
	return offset + 4;
}

function write_i16(view: DataView, offset: number, value: number)
{
	view.setInt16(offset, value, true);
	return offset + 2;
}

function write_i8(view: DataView, offset: number, value: number)
{
	view.setInt8(offset, value);
	return offset + 1;
}

function read_s8(view: DataView, offset: number): string
{
	let r = "";
	let byte: number = 0;
	for (let i = 0; (byte = view.getUint8(offset + i)); i++)
	{
		if (byte === 0)
		{
			break;
		}
		r += String.fromCharCode(byte);
	}
	return r;
}

function write_s8(view: DataView, offset: number, str: string, max_size = 16) {
	let i = 0;
	for (; i < str.length; i += 1)
	{
		offset = write_u8(view, offset, str.charCodeAt(i));
	}
	for (; i < max_size; i += 1)
	{
		offset = write_u8(view, offset, 0); 
	}
	return offset;
}

enum PacketKind {
	PacketKind_LoadAsset	= 1 << 0,
	PacketKind_Ping				= 1 << 1,
	PacketKind_Pong				= 1 << 2
}

enum AgentKind {
	AgentKind_Server				= 1 << 0,
	AgentKind_Anonymous			= 1 << 1,
	AgentKind_Player				= 1 << 2,
	AgentKind_Administrator	= 1 << 3
}

type Agent = {
	// u64
	id:		number;
	// u32
	kind: AgentKind;
	// s8 -- max size 16
	name: string;
}
const PACKET_AGENT_PAYLOAD_SIZE = 28;

type PacketPing = {
	msg:	string;
}
const PACKET_PING_PAYLOAD_SIZE = 16;

type PacketPong = {
	msg:	string;
}
const PACKET_PONG_PAYLOAD_SIZE = 16;

export type Packet = {
	// u32
	size:	number;
	// u32 -- used to identify 
	// the packet in the server 
	kind: number;
	agent: Agent;
	payload: PacketPong | PacketPing;
}

const PACKET_SIZE = 8 + PACKET_AGENT_PAYLOAD_SIZE;

// id 0 -> reserverd for anonymous agents 
// id 1 -> reserverd for server	agent
export function agent_anonymous_make(): Agent 
{
	return {
		name: "anonymous",
		kind: AgentKind.AgentKind_Anonymous,
		id: ANONYMOUS_ID
	}
}

export function agent_deserialize(dv: DataView, offset = 0): Agent 
{
	const id	 = get_u64(dv, offset); 
	const kind = dv.getUint32(offset + 8, true); 
	const name = read_s8(dv, offset + 12); 
	return {
		id,
		kind,
		name
	}
}

// order ->
// size
// kind
// agent
// packet specific data
export function packet_serialize(packet: Packet): ArrayBuffer 
{
	const buffer	= new ArrayBuffer(packet.size);
	const dv			= new DataView(buffer);

	let offset	= write_u32(dv, 0, packet.size);
	offset			= write_u32(dv, offset, packet.kind);
	offset			= write_u64(dv, offset, packet.agent.id);
	offset			= write_u32(dv, offset, packet.agent.kind);
	offset			= write_s8(dv, offset, packet.agent.name);
	switch (packet.kind)
	{
		case PacketKind.PacketKind_Pong:
		case PacketKind.PacketKind_Ping: {
			write_s8(dv, offset, packet.payload.msg);
		} break;
		default: {
		} break;
	}

	return (dv.buffer);
}

export function packet_pong_deserialize(data: DataView, offset = 0): PacketPong 
{
	const msg = read_s8(data, offset);
	return { msg }
}

export function packet_ping_make()
{
	const packet: Packet = {} as Packet;
	packet.size = PACKET_SIZE + PACKET_PING_PAYLOAD_SIZE;
	packet.agent = agent_anonymous_make();
	packet.kind = PacketKind.PacketKind_Ping;
	packet.payload = {
		msg: "ping",
	} as PacketPing
	return (packet);
}

export const PingPacket = packet_ping_make(); 

export function packet_deserialize(data: ArrayBuffer): Packet
{
	const dv = new DataView(data);

	const packet: Packet = {} as Packet;
	packet.size	= dv.getUint32(0, true);
	packet.kind	= dv.getUint32(4, true);
	packet.agent = agent_deserialize(dv, 8); 
	switch (packet.kind)
	{
		case PacketKind.PacketKind_Pong: {
			packet.payload = packet_pong_deserialize(dv, 8+PACKET_AGENT_PAYLOAD_SIZE);
		} break;
		default: {
		} break;
	}
	return (packet as Packet);
}
