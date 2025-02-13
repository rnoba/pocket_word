export const SERVER_ID			= 1;
export const ANONYMOUS_ID	= 0;

function write_u64(view: DataView, offset: number, value: number)
{
	const low		= value & 0xFFFFFFFF;
	const high	= value / 2 ** 32; 
	view.setUint32(offset, low, true);
	view.setUint32(offset + 4, high, true);
	return offset + 8;
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

function write_s8(view: DataView, offset: number, str: string) {
	let i = 0;
	for (; i < str.length; i += 1)
	{
		offset = write_u8(view, offset, str.charCodeAt(i));
	}
	return offset;
}

function read_u32(view: DataView, offset: number)
{
	const u32 = view.getUint32(offset, true);
	return [u32, offset + 4];
}

function read_u16(view: DataView, offset: number)
{
	const u16 = view.getUint16(offset, true);
	return [u16, offset + 2];
}

function read_u8(view: DataView, offset: number)
{
	const byte = view.getUint8(offset);
	return [byte, offset + 1];
}

function read_i64(view: DataView, offset: number)
{
	const low		= view.getInt32(offset, true); 
	const high	= view.getInt32(offset + 4, true); 
	const value = (high * 2 ** 32) + low;
	return [value, offset + 8];
}

function read_i32(view: DataView, offset: number)
{
	const i32 = view.getInt32(offset, true);
	return [i32, offset + 4];
}

function read_i16(view: DataView, offset: number)
{
	const i16 = view.getInt16(offset, true);
	return [i16, offset + 2];
}

function read_i8(view: DataView, offset: number)
{
	const byte = view.getInt8(offset);
	return [byte, offset + 1];
}

function read_s8(view: DataView, offset: number, length: number): [string, number]
{
	let r = "";
	let byte: number = 0;

	let i = 0;
	for (i; i < length; i++)
	{
		byte = view.getUint8(offset + i);
		r += String.fromCharCode(byte);
	}
	return [r, offset + i];
}

function read_u64(view: DataView, offset: number): [number, number]
{
	const low		= view.getUint32(offset, true); 
	const high	= view.getUint32(offset + 4, true); 
	const value = (high * 2 ** 32) + low;

	return [value, offset + 8];
}

export enum PacketKind {
	PacketKind_SpriteInfo					= 1 << 0,
	PacketKind_Ping								= 1 << 1,
	PacketKind_Pong								= 1 << 2,
	PacketKind_RequestSpriteInfo	= 1 << 3,
	PacketKind_AuthenticationClient	= 1 << 4,
	PacketKind_Ok										= 1 << 5,
	PacketKind_AuthenticationServer	= 1 << 6,
}

export const packet_kind_to_string = {
	[PacketKind.PacketKind_SpriteInfo]: "<SPRITE INFO>",
	[PacketKind.PacketKind_Ping]: "<PING>",	
	[PacketKind.PacketKind_Pong]: "<PONG>",	
	[PacketKind.PacketKind_RequestSpriteInfo]: "<REQUEST SPRITE INFO>",
	[PacketKind.PacketKind_AuthenticationClient]: "<AUTHENTICATION CLIENT>",
	[PacketKind.PacketKind_Ok]: "<OK>",	
	[PacketKind.PacketKind_AuthenticationServer]: "<AUTHENTICATION SERVER>"
} as Record<PacketKind, string>; 

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
	// string len 
	length: number;
	name: string;
}

function agent_size(agent: Agent) {
	return 16 + agent.length;
}

type PacketPing = {
	length: number;
	msg:	string;
}

export type PacketOk = {
	ok: number;
	ctx: PacketKind;
}

type PacketAuthenticationClient = {
	// u32
	username_len: number;
	username: string;
	// u32
	password_len: number;
	password: string;
}

export type PacketAuthenticationServer = {
	//u64;
	user_id: number;
	//u8
	is_admin: number;
	// u32
	username_len: number;
	username: string;
	//u32
	created_at_len: number;
	created_at: string;
}

type PacketPong = {
	length: number;
	msg:	string;
}

const PingPongSize = 9;

type PacketRequestSpriteInfo = {
	length:				number;
	source_file:	string;
}

export type PacketSpriteInfo = {
	id:				number;
	offset_x: number;
	offset_y: number;
	width:		number;
	height:		number;
	source_file_length: number;
	source_file:				string;
	created_at_length:	number;
	created_at:					string;
	descrition_length:	number;
	descrition:					string;
	name_length:				number;
	name:								string;
}

export type Packet = {
	// u32
	size:	number;
	// u32 -- used to identify 
	// the packet in the server 
	kind: number;
	agent: Agent;
	payload: PacketAuthenticationClient |
					 PacketRequestSpriteInfo |
					 PacketSpriteInfo |
					 PacketAuthenticationServer |
					 PacketPong |
					 PacketOk |
					 PacketPing;
}

// id 0 -> reserverd for anonymous agents 
// id 1 -> reserverd for server	agent
export function agent_anonymous_make(): Agent 
{
	return {
		name: "anonymous",
		kind: AgentKind.AgentKind_Anonymous,
		id: ANONYMOUS_ID,
		length: 9
	}
}

export function packet_ping_make()
{
	const packet: Packet = {} as Packet;
	packet.agent = agent_anonymous_make();
	packet.kind = PacketKind.PacketKind_Ping;
	packet.payload = {
		msg: "ping",
		length: 4
	} as PacketPing
	packet.size = 8 + agent_size(packet.agent) + PingPongSize;
	return (packet);
}

export function packet_pong_make()
{
	const packet: Packet = {} as Packet;
	packet.agent = agent_anonymous_make();
	packet.kind = PacketKind.PacketKind_Ping;
	packet.payload = {
		msg: "pong",
		length: 4
	} as PacketPing
	packet.size = 8 + agent_size(packet.agent) + PingPongSize;
	return (packet);
}

export function packet_authentication_client_make(username: string, password: string): Packet
{
	const packet: Packet = {} as Packet;
	packet.agent = agent_anonymous_make();
	packet.kind = PacketKind.PacketKind_AuthenticationClient;
	packet.payload = {
		username_len: username.length,
		username,
		password_len: password.length,
		password
	} as PacketAuthenticationClient; 
	packet.size = 8 + agent_size(packet.agent) + packet.payload.password_len +
		packet.payload.username_len + 8;
	return packet;
}

export const PingPacket = packet_ping_make(); 
export const PongPacket = packet_pong_make(); 

export function packet_request_sprite_info_make(source_file: string | null = null)
{
	const packet: Packet = {} as Packet;

	packet.agent		= agent_anonymous_make();
	packet.kind			= PacketKind.PacketKind_RequestSpriteInfo;

	const len = source_file ? source_file.length : 0; 
	packet.payload	= {
		source_file: source_file ? source_file : "",
		length: len 
	} as PacketRequestSpriteInfo;

	packet.size = 8 + agent_size(packet.agent) + 4 + len; 
	return (packet);
}

export function packet_serialize(packet: Packet): ArrayBuffer 
{
	const buffer	= new ArrayBuffer(packet.size);
	const dv			= new DataView(buffer);

	let offset	= write_u32(dv, 0, packet.size);
	offset			= write_u32(dv, offset, packet.kind);
	offset			= write_u64(dv, offset, packet.agent.id);
	offset			= write_u32(dv, offset, packet.agent.kind);
	offset			= write_u32(dv, offset, packet.agent.length);
	offset			= write_s8(dv,	offset, packet.agent.name);

	switch (packet.kind)
	{
		case PacketKind.PacketKind_Pong:
		case PacketKind.PacketKind_Ping: {
			const payload = packet.payload as PacketPong;
			offset = write_u32(dv, offset, payload.length);
			write_s8(dv, offset, payload.msg);
		} break;
		case PacketKind.PacketKind_RequestSpriteInfo: {
			const payload = (packet.payload) as PacketRequestSpriteInfo;
			offset = write_u32(dv, offset, payload.length);
			write_s8(dv, offset, payload.source_file);
		} break;
		case PacketKind.PacketKind_SpriteInfo: {
			const payload = (packet.payload) as PacketSpriteInfo;
			offset = write_u64(dv, offset, payload.id);
			offset = write_i32(dv, offset, payload.offset_x);
			offset = write_i32(dv, offset, payload.offset_y);
			offset = write_i32(dv, offset, payload.width);
			offset = write_i32(dv, offset, payload.height);
			offset = write_u32(dv, offset, payload.source_file_length);
			offset = write_s8(dv, offset, payload.source_file);
			offset = write_u32(dv, offset, payload.created_at_length);
			offset = write_s8(dv, offset, payload.created_at);
			offset = write_u32(dv, offset, payload.descrition_length);
			offset = write_s8(dv, offset, payload.descrition);
			offset = write_u32(dv, offset, payload.name_length);
			write_s8(dv, offset, payload.name);
		} break;
		case PacketKind.PacketKind_AuthenticationClient: {
			const payload = (packet.payload) as PacketAuthenticationClient;
			offset = write_u32(dv, offset, payload.username_len);
			offset = write_s8(dv, offset, payload.username);
			offset = write_u32(dv, offset, payload.password_len);
			write_s8(dv, offset, payload.password);
		}
		default: {
		} break;
	}

	return (dv.buffer);
}

export function agent_deserialize(dv: DataView, offset = 0): Agent 
{

	let [id,			offseta]	= read_u64(dv,	offset); 
	let [kind,		offsetb]	= read_u32(dv,	offseta); 
	let [length,	offsetc]	= read_u32(dv,	offsetb); 
	let [name,		_]				= read_s8(dv,		offsetc, length); 

	return {
		id,
		kind,
		name,
		length
	}
}

export function packet_pongping_deserialize(dv: DataView, offset = 0): PacketPong 
{
	const [length, offseta]	= read_u32(dv, offset); 
	const [msg,		_]				= read_s8(dv, offseta, length);
	return { msg, length };
}

export function packet_authentication_server_deserialize(dv: DataView, offset = 0): PacketAuthenticationServer
{
	const [user_id, offseta]	= read_u64(dv, offset); 
	const [is_admin, offsetb]	= read_u8(dv, offseta);
	const [username_len, offsetc]	= read_u32(dv, offsetb);
	const [username, offsetd]	= read_s8(dv, offsetc, username_len);
	const [created_at_len, offsete]	= read_u32(dv, offsetd);
	const [created_at, _]	= read_s8(dv, offsete, created_at_len);

	return {
		user_id,
		is_admin,
		username_len,
		username,
		created_at_len,
		created_at
	} as PacketAuthenticationServer;
}

export function packet_sprite_info_deserialize(dv: DataView, offset = 0): PacketSpriteInfo
{
	// TODO(rnoba): make this better ;-;
	const [id, offseta]						= read_u64(dv, offset); 
	const [offset_x, offsetb]			= read_u32(dv, offseta); 
	const [offset_y, offsetc]			= read_u32(dv, offsetb); 
	const [width, offsetd]				= read_u32(dv, offsetc); 
	const [height, offsete]				= read_u32(dv, offsetd); 
	const [source_file_len, offsetf]		= read_u32(dv, offsete); 
	const [source_file, offsetg]				= read_s8(dv, offsetf, source_file_len); 
	const [created_at_len, offseth]			= read_u32(dv, offsetg);
	const [created_at, offseti]					= read_s8(dv, offseth, created_at_len);
	const [descrition_len, offsetj]			= read_u32(dv, offseti);
	const [descrition, offsetk]					= read_s8(dv, offsetj, descrition_len);
	const [name_len, offsetl]						= read_u32(dv, offsetk);
	const [name, _]											= read_s8(dv, offsetl, name_len);

	return {
		id,
		offset_x,
		offset_y,
		width,
		height,
		source_file_length: source_file_len,
		source_file,
		created_at_length: created_at_len,
		created_at,
		descrition_length: descrition_len,
		descrition,
		name_length: name_len,
		name: name
	}
}

export function packet_deserialize(data: ArrayBuffer): Packet
{
	const dv = new DataView(data);

	const packet: Packet = {} as Packet;
	packet.size		= dv.getUint32(0, true);
	packet.kind		= dv.getUint32(4, true);
	packet.agent	= agent_deserialize(dv, 8); 

	const offset = 8+agent_size(packet.agent);
	switch (packet.kind)
	{
		case PacketKind.PacketKind_Ping:
		case PacketKind.PacketKind_Pong: {
			packet.payload = packet_pongping_deserialize(dv, offset);
		} break;
		case PacketKind.PacketKind_SpriteInfo:
		{
			packet.payload = packet_sprite_info_deserialize(dv, offset);
		} break;
		case PacketKind.PacketKind_Ok:
		{
			const [ok,	offseta] = read_u8(dv, offset); 
			const [ctx, _]	= read_u32(dv, offseta);
			const payload = {
				ok,
				ctx
			} as PacketOk;
			packet.payload = payload;
		} break;
		case PacketKind.PacketKind_AuthenticationServer:
		{
			packet.payload = packet_authentication_server_deserialize(dv, offset);
		}
		default: {
		} break;
	}
	return (packet as Packet);
}
