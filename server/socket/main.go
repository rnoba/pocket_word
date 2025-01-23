package server

import (
	"bytes"
	"encoding/binary"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rnoba/pocket_world/server/database"
)

var ANONYMOUS_ID	= uint64(0)
var SERVER_ID			= uint64(1)

const (
	PacketKind_SpriteInfo					= 1 << 0
	PacketKind_Ping								= 1 << 1
	PacketKind_Pong								= 1 << 2
	PacketKind_RequestSpriteInfo	= 1 << 3
	PacketKind_AuthenticationClient	= 1 << 4
	PacketKind_Ok										= 1 << 5
	PacketKind_AuthenticationServer	= 1 << 6
)

const (
	AgentKind_Server				= 1 << 0
	AgentKind_Anonymous			= 1 << 1
	AgentKind_Player				= 1 << 2
	AgentKind_Administrator	= 1 << 3
)

type Agent struct {
	Id			uint64;
	Kind		uint32;
	NameLen uint32;
	Name		string;
}

type PacketPingPong struct {
	DataLen uint32;
	Data		string; 
}

type PacketRequestSpriteInfo struct {
	SourceFileLen uint32;
	SourceFile		string;
}

type PacketSpriteInfo struct {
	Id					uint64;
	OffsetX			int32;
	OffsetY			int32;
	Width				int32;
	Height			int32;
	SourceFileLen uint32;
	SourceFile		string;
	CreatedAtLen	uint32;
	CreatedAt			string;
	DescriptionLen uint32;
	Description		string;
	NameLen				uint32;
	Name					string;
}

// very safe
type PacketAuthenticationClient struct {
	UsernameLen uint32;
	Username string;
	PasswordLen uint32;
	PasswordString string;
}

type PacketAuthenticationServer struct {
	UserId uint64;
	IsAdmin uint8;
	UsernameLen uint32;
	Username string;
	CreatedAtLen uint32;
	CreatedAt string;
}

type Packet struct {
	Size	uint32
	Kind	uint32
	Agent Agent
	Payload interface{}
}

type PacketOk struct {
	ok uint8;
	ctx uint32;
}

func AgentAnonymousMake() Agent {
	agent := Agent{
		NameLen: 9,
		Name: "ANONYMOUS", 
		Id:		ANONYMOUS_ID,
		Kind: AgentKind_Anonymous,
	}
	return (agent);
}

func AgentServerMake() Agent {
	agent := Agent{
		NameLen: 6,
		Name: "SERVER", 
		Id:		SERVER_ID,
		Kind: AgentKind_Server,
	}
	return (agent);
}

func PacketOkMake(ok uint8, ctx uint32) (*Packet, error) {
	packet := &Packet{
		Size:   0,
		Kind:   PacketKind_Ok,
		Agent:  AgentServerMake(),
		Payload: PacketOk{
			ok: ok,
			ctx: ctx,
		},
	}
	packet.Size = packet.Len(); 
	if packet.Size == 0 {
		return nil, fmt.Errorf("Could not make packet");
	}
	return packet, nil;
}
func PacketPongMake() (*Packet, error) {
	packet := &Packet{
		Size:   0,
		Kind:   PacketKind_Pong,
		Agent:  AgentServerMake(),
		Payload: PacketPingPong{
			Data: "PONG",
			DataLen: 4,
		},
	}
	packet.Size = packet.Len(); 
	if packet.Size == 0 {
		return nil, fmt.Errorf("Could not make packet");
	}
	return packet, nil 
}


func PacketAuthenticationServerMake(user *database.User) (*Packet, error) {
	created_at := user.CreatedAt.String();
	admin := uint8(0)
	if user.IsAdmin {
		admin = 1;
	}
	packet := &Packet{
		Size:   0,
		Kind:   PacketKind_AuthenticationServer,
		Agent:  AgentServerMake(),
		Payload: PacketAuthenticationServer{
			UserId: user.Id,
			IsAdmin: admin,
			UsernameLen: uint32(len(user.Username)),
			Username: user.Username,
			CreatedAtLen: uint32(len(created_at)),
			CreatedAt: created_at,
		},
	}
	packet.Size = packet.Len(); 
	if packet.Size == 0 {
		return nil, fmt.Errorf("Could not make packet");
	}
	return packet, nil 
}

func PacketPingMake() (*Packet, error) {
	packet := &Packet{
		Size:   0,
		Kind:   PacketKind_Ping,
		Agent:  AgentServerMake(),
		Payload: PacketPingPong{
			Data: "PING",
		},
	}
	packet.Size = packet.Len(); 
	if packet.Size == 0 {
		return nil, fmt.Errorf("Could not make packet");
	}
	return packet, nil 
}

func PacketSpriteInfoMake(item database.Item) (*Packet, error) {
	created_at := item.CreatedAt.String();
	packet := &Packet{
		Size:   0,
		Kind:   PacketKind_SpriteInfo,
		Agent:  AgentServerMake(),
		Payload: PacketSpriteInfo{
			Id: item.Id,
			OffsetX: item.OffsetX,
			OffsetY: item.OffsetY,
			Width:	item.Width,
			Height: item.Height,
			SourceFileLen: uint32(len(item.SourceFile)),
			SourceFile: item.SourceFile,
			CreatedAtLen: uint32(len(created_at)),
			CreatedAt: created_at,
			DescriptionLen: uint32(len(item.Description)),
			Description: item.Description,
			NameLen: uint32(len(item.Name)),
			Name: item.Name,
		},
	}
	packet.Size = packet.Len(); 
	if packet.Size == 0 {
		return nil, fmt.Errorf("Could not make packet");
	}
	return packet, nil 
}

func (packet *Packet) Len() uint32 {
	var size uint32 = 0;

	buffer, err := packet.Serialize();
	if err != nil {
		return 0;
	}
	size = uint32(buffer.Len());
	return size;
}


func serialize_string(buffer *bytes.Buffer, str string, expected_len uint32) error {
	if err := binary.Write(buffer, binary.LittleEndian, expected_len); err != nil {
		return err;
	}

	sz, _ := buffer.WriteString(str);
	if uint32(sz) != expected_len {
		return fmt.Errorf("(serialize_string): error: write size `%d` mismatch with expected size `%d`",
			sz,
			expected_len);
	}
	return nil;
}

func serialize_fields(fields []interface{}, buffer *bytes.Buffer) error {
	for _, field := range fields {
		if err := binary.Write(buffer, binary.LittleEndian, field); err != nil {
			return err;
		}
	}
	return nil;
}

func serialize_common(packet *Packet, buffer *bytes.Buffer) error {
	fields := []interface{}{
		&packet.Size,
		&packet.Kind,
		&packet.Agent.Id,
		&packet.Agent.Kind,
	}
	err_fields := serialize_fields(fields, buffer);
	err_string := serialize_string(buffer, packet.Agent.Name, packet.Agent.NameLen);
	return errors.Join(err_fields, err_string);
}

func (packet *Packet) Serialize() (*bytes.Buffer, error) {
	buffer := new(bytes.Buffer);

	if err := serialize_common(packet, buffer); err != nil {
		return nil, err;
	}

	switch payload := packet.Payload.(type) {
		case PacketPingPong:
		{
			if err := serialize_string(buffer, payload.Data, payload.DataLen); err != nil {
				return nil, err;
			}
		}
		case PacketRequestSpriteInfo:
		{
			if err := serialize_string(buffer, payload.SourceFile,	payload.SourceFileLen); err != nil {
				return nil, err;
			}
		}
		case PacketSpriteInfo:
		{
			fields := []interface{}{
				&payload.Id,
				&payload.OffsetX,
				&payload.OffsetY,
				&payload.Width,
				&payload.Height,
			}
			if err := serialize_fields(fields, buffer); err != nil {
				return nil, err;
			}
			err_sf := serialize_string(buffer, payload.SourceFile,	payload.SourceFileLen);
			err_ca := serialize_string(buffer, payload.CreatedAt,		payload.CreatedAtLen);
			err_ds := serialize_string(buffer, payload.Description,	payload.DescriptionLen);
			err_tl := serialize_string(buffer, payload.Name,				payload.NameLen);
			// lol 
			if err := errors.Join(err_sf, err_ca, err_ds, err_tl); err != nil {
				return nil, err;
			}
		}
		case PacketOk:
		{
			if err := binary.Write(buffer, binary.LittleEndian, payload.ok); err != nil {
				return nil, err;
			}
			if err := binary.Write(buffer, binary.LittleEndian, payload.ctx); err != nil {
				return nil, err;
			}
		}
		case PacketAuthenticationServer:
		{
			err := binary.Write(buffer, binary.LittleEndian, payload.UserId);
			if err != nil {
				return nil, err;
			}
			erra := binary.Write(buffer, binary.LittleEndian, payload.IsAdmin);
			if erra != nil {
				return nil, erra;
			}
			err_a := serialize_string(buffer, payload.Username,	payload.UsernameLen);
			err_b := serialize_string(buffer, payload.CreatedAt,	payload.CreatedAtLen);
			if err := errors.Join(err_a, err_b); err != nil {
				return nil, err;
			}
		}
		default:
			return nil, fmt.Errorf("unsupported payload type");
	}
	return buffer, nil;
}

func deserialize_string(buffer *bytes.Reader, dest_string *string) (uint32, error) {
	var size uint32 = 0;
	if err := binary.Read(buffer, binary.LittleEndian, &size); err != nil {
		return 0, err;
	}

	if size <= 0 || size > 1024 {
		return size, fmt.Errorf(
			"(deserialize_string): trying to deserialize strange string size `%d`",
			size);
	}
	data := make([]byte, size);
	if err := binary.Read(buffer, binary.LittleEndian, &data); err != nil {
		return 0, err;
	}
	*dest_string = string(data);
	return size, nil;
}

func deserialize_fields(fields []interface{}, buffer *bytes.Reader) error {
	for _, field := range fields {
		if err := binary.Read(buffer, binary.LittleEndian, field); err != nil {
			return err;
		}
	}
	return nil;
}

func deserialize_common(packet *Packet, buffer *bytes.Reader) error {
	fields := []interface{}{
		&packet.Size,
		&packet.Kind,
		&packet.Agent.Id,
		&packet.Agent.Kind,
	}

	if err := deserialize_fields(fields, buffer); err != nil {
		return err;
	}

	size, err := deserialize_string(buffer, &packet.Agent.Name);
	if err != nil {
		return err;
	}
	packet.Agent.NameLen = size;
	return nil;
}

func Deserialize(data []byte) (*Packet, error) {
	buffer := bytes.NewReader(data);
	packet := new(Packet);

	if err := deserialize_common(packet, buffer); err != nil {
		return nil, err;
	}

	switch packet.Kind {
		case PacketKind_Pong:
		case PacketKind_Ping:
		{
			var packet_payload PacketPingPong;
			size, err := deserialize_string(buffer, &packet_payload.Data);
			if err != nil {
				return nil, err;
			}
			packet_payload.DataLen	= size;

			packet.Payload = packet_payload;
		}
		case PacketKind_RequestSpriteInfo: {
			var packet_payload PacketRequestSpriteInfo;

			size, err := deserialize_string(buffer, &packet_payload.SourceFile);
			if err != nil {
				return nil, err;
			}
			packet_payload.SourceFileLen = size;

			packet.Payload = packet_payload;
		}
		case PacketKind_SpriteInfo:
		{
			var packet_payload PacketSpriteInfo;

			fields := []interface{}{
				&packet_payload.Id,
				&packet_payload.OffsetX,
				&packet_payload.OffsetY,
				&packet_payload.Width,
				&packet_payload.Height,
			}

			if err := deserialize_fields(fields, buffer); err != nil {
				return nil, err;
			}

			source_file_len,	err_a := deserialize_string(buffer, &packet_payload.SourceFile);
			created_at_len,		err_b := deserialize_string(buffer, &packet_payload.CreatedAt);
			description_len,	err_c := deserialize_string(buffer, &packet_payload.Description);
			name_len,					err_d := deserialize_string(buffer, &packet_payload.Name);

			if err := errors.Join(err_a, err_b, err_c, err_d); err != nil {
				return nil, err;
			}
			packet_payload.SourceFileLen	= source_file_len;
			packet_payload.CreatedAtLen		= created_at_len;
			packet_payload.DescriptionLen	= description_len;
			packet_payload.NameLen				= name_len;
			packet.Payload = packet_payload;
		}
		case PacketKind_AuthenticationClient:
		{
			var packet_payload PacketAuthenticationClient;
			sza, a := deserialize_string(buffer, &packet_payload.Username);
			szb, b := deserialize_string(buffer, &packet_payload.PasswordString);
			packet_payload.UsernameLen = sza;
			packet_payload.PasswordLen = szb;

			if err := errors.Join(a, b); err != nil {
				return nil, err;
			}
			packet.Payload = packet_payload;
		}
		default:
			log.Panicf("unrecognized packet kind");
	}
	return packet, nil;
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin");
    return origin == "http://localhost:8000";
	},
}

func try_send_packet(socket *websocket.Conn, packet *Packet) error {
	fmt.Println("Sending: ", packet);

	buffer, err := packet.Serialize();
	if err != nil {
		return err;
	}
	send_err := socket.WriteMessage(
		websocket.BinaryMessage,
		buffer.Bytes());
	return send_err;
}

func try_send_ok(socket *websocket.Conn, ok uint8, ctx uint32) error {
	packet, err := PacketOkMake(ok, ctx);
	if err != nil {
		return err;
	}
	return try_send_packet(socket, packet);
}

func server(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil);

	if err != nil {
		log.Print("upgrade:", err);
		return;
	}
	defer socket.Close();
	for {
		msg_type, reader, err := socket.NextReader();
		if err != nil {
			break;
		}

		if msg_type != websocket.BinaryMessage {
			fmt.Println("Server received unexpected message type");
			break;
		}

		data, err := io.ReadAll(reader);
		if (err != nil) {
			log.Println("Failed to read received data: ", err);
			continue;
		}

		packet, err := Deserialize(data);
		if err != nil {
			fmt.Println("(Deserialize) Failed to deserialize packet: ", err);
			break;
		}

		fmt.Printf("Received packet: %+v\n", packet);
		switch packet.Kind {
			case PacketKind_Ping:
			{
				packet, err := PacketPongMake();
				if err != nil {
					fmt.Println("(PacketPongMake) error: Failed to make ping packet: ", err);
					continue;
				}
				if err := try_send_packet(socket, packet); err != nil {
					fmt.Println("Could not send packet: ", err);
				}
			}
			case PacketKind_Pong:
			{
				packet, err := PacketPingMake();
				if err != nil {
					fmt.Println("(PacketPingMake) error: Failed to make ping packet: ", err);
					continue;
				}
				if err := try_send_packet(socket, packet); err != nil {
					fmt.Println("Could not send packet: ", err);
				}
			}
			case PacketKind_RequestSpriteInfo:
			{
				if payload, ok	:= packet.Payload.(PacketRequestSpriteInfo); ok {
					items,		err	:= database.QueryAllFromSourceFile(database.Pool, payload.SourceFile);

					if err != nil {
						fmt.Println("(QueryAllFromSourceFile) error: ", err);
						continue;
					}

					for _, item := range items {
						packet, err := PacketSpriteInfoMake(item);
						if err != nil {
							fmt.Println(err);
							continue;
						}
						if err := try_send_packet(socket, packet); err != nil {
							fmt.Println("Could not send packet: ", err);
						}
					}
				}
			}
			case PacketKind_SpriteInfo:
			{
				if payload, ok	:= packet.Payload.(PacketSpriteInfo); ok {
					if packet.Agent.Id < 2 {
						socket.Close();
						return;
					}

					user, err := database.UserById(database.Pool, packet.Agent.Id);
					if err != nil {
						socket.Close();
						return;
					}

					if !user.IsAdmin {
						socket.Close();
						return;
					}

					create_err := database.CreateItem(
						database.Pool,
						payload.SourceFile,
						payload.OffsetX,
						payload.OffsetY,
						payload.Width,
						payload.Height,
						payload.Description,
						payload.Name);

					var ok uint8 = 1;
					if create_err != nil {
						ok = 0;
					}
					try_send_ok(socket, ok, PacketKind_SpriteInfo);
				}
			}
			case PacketKind_AuthenticationClient:
			{
				if payload, ok	:= packet.Payload.(PacketAuthenticationClient); ok {
					user, err := database.UserByUsername(database.Pool, payload.Username);

					if err != nil {
						try_send_ok(socket, 0, PacketKind_AuthenticationClient);
						return;
					}

					ok := database.CheckPasswordHash(user.PasswordHash, payload.PasswordString);
					if !ok {
						try_send_ok(socket, 0, PacketKind_AuthenticationClient);
						break;
					}

					packet, err := PacketAuthenticationServerMake(user);
					if err != nil {
						try_send_ok(socket, 0, PacketKind_AuthenticationClient);
						break;
					}

					err_send := try_send_packet(socket, packet);
					if err_send != nil {
						try_send_ok(socket, 1, PacketKind_AuthenticationClient);
					}
				}
			}
			default:
			{
				fmt.Println("Unrecognized packet kind");
			}
		}
	}
}

var addr = flag.String("addr", "localhost:8080", "http service address");
func StartServer() {
	http.HandleFunc("/", server);

	fmt.Println("Server running");
	log.Fatal(http.ListenAndServe(*addr, nil));
}
