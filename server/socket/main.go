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

type Packet struct {
	Size	uint32
	Kind	uint32
	Agent Agent
	Payload interface{}
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
			title_len,				err_d := deserialize_string(buffer, &packet_payload.Name);

			// one error discard packet
			if err := errors.Join(err_a, err_b, err_c, err_d); err != nil {
				return nil, err;
			}
			packet_payload.SourceFileLen	= source_file_len;
			packet_payload.CreatedAtLen		= created_at_len;
			packet_payload.DescriptionLen	= description_len;
			packet_payload.NameLen				= title_len;
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
