package server

import (
	"bytes"
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/rnoba/pocket_world/server/database"
)

//TODO(rnoba) rafactoring
var ANONYMOUS_ID	= uint64(0)
var SERVER_ID			= uint64(1)

const (
	PacketKind_SpriteInfo	= 1 << 0
	PacketKind_Ping				= 1 << 1
	PacketKind_Pong				= 1 << 2
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

type PacketPing struct {
	DataLen uint32;
	Data		string;
}

type PacketPong struct {
	DataLen uint32;
	Data		string; 
}

type PacketSpriteInfo struct {
	Id					int64;
	OffsetX			int32;
	OffsetY			int32;
	Width				int32;
	Height			int32;

	SourceFileLen uint32;
	SourceFile		string;
	CreatedAtLen	uint32;
	CreatedAt			string;
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
		Payload: PacketPong{
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
		Payload: PacketPing{
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

func (packet *Packet) Serialize() (*bytes.Buffer, error) {
	buffer := new(bytes.Buffer);

	if err := binary.Write(buffer, binary.LittleEndian, &packet.Size); err != nil {
		return nil, err;
	}
	if err := binary.Write(buffer, binary.LittleEndian, &packet.Kind); err != nil {
		return nil, err;
	}

	if err := binary.Write(buffer, binary.LittleEndian, &packet.Agent.Id); err != nil {
		return nil, err;
	}

	if err := binary.Write(buffer, binary.LittleEndian, &packet.Agent.Kind); err != nil {
		return nil, err;
	}

	if err := binary.Write(buffer, binary.LittleEndian, &packet.Agent.NameLen); err != nil {
		return nil, err;
	}

	sz, _ := buffer.WriteString(packet.Agent.Name);
	if (uint32(sz) != packet.Agent.NameLen) {
		fmt.Println("WARNING, serialization write size mismatch", sz, packet.Agent.NameLen);
	}

	switch payload := packet.Payload.(type) {
		case PacketPing:
		case PacketPong:
		{
			if err := binary.Write(buffer, binary.LittleEndian, &payload.DataLen); err != nil {
				return nil, err
			}
			sz, _ = buffer.WriteString(payload.Data);
			if (uint32(sz) != payload.DataLen) {
				fmt.Println("WARNING, serialization write size mismatch");
			}
		}
		case PacketSpriteInfo:
		{
			if err := binary.Write(buffer, binary.LittleEndian, &payload.Id); err != nil {
				return nil, err;
			}
			if err := binary.Write(buffer, binary.LittleEndian, &payload.OffsetX); err != nil {
				return nil, err;
			}
			if err := binary.Write(buffer, binary.LittleEndian, &payload.OffsetY); err != nil {
				return nil, err;
			}
			if err := binary.Write(buffer, binary.LittleEndian, &payload.Width); err != nil {
				return nil, err;
			}
			if err := binary.Write(buffer, binary.LittleEndian, &payload.Height); err != nil {
				return nil, err;
			}

			if err := binary.Write(buffer, binary.LittleEndian, &payload.SourceFileLen); err != nil {
				return nil, err;
			}

			if _, err := buffer.WriteString(payload.SourceFile); err != nil {
				return nil, err;
			}

			if err := binary.Write(buffer, binary.LittleEndian, &payload.CreatedAtLen); err != nil {
				return nil, err;
			}

			if _, err := buffer.WriteString(payload.CreatedAt); err != nil {
				return nil, err;
			}
		}
		default:
			return nil, fmt.Errorf("unsupported Payload type");
	}
	return buffer, nil;
}

func Deserialize(data []byte) (*Packet, error) {
	buffer := bytes.NewReader(data);

	packet := new(Packet);
	if err := binary.Read(buffer, binary.LittleEndian, &packet.Size); err != nil {
		return nil, err;
	}
	if err := binary.Read(buffer, binary.LittleEndian, &packet.Kind); err != nil {
		return nil, err;
	}
	if err := binary.Read(buffer, binary.LittleEndian, &packet.Agent.Id); err != nil {
		return nil, err;
	}
	if err := binary.Read(buffer, binary.LittleEndian, &packet.Agent.Kind); err != nil {
		return nil, err;
	}

	if err := binary.Read(buffer, binary.LittleEndian, &packet.Agent.NameLen); err != nil {
		return nil, err;
	}

	name_bytes := make([]byte, packet.Agent.NameLen);
	if err := binary.Read(buffer, binary.LittleEndian, &name_bytes); err != nil {
		return nil, err;
	}
	packet.Agent.Name = string(name_bytes);

	switch packet.Kind {
		case PacketKind_Ping:
		{
			var ping_packet_payload PacketPing;

			if err := binary.Read(buffer, binary.LittleEndian, &ping_packet_payload.DataLen); err != nil {
				return nil, err;
			}

			packet_payload_bytes := make([]byte, ping_packet_payload.DataLen);
			if err := binary.Read(buffer, binary.LittleEndian, &packet_payload_bytes); err != nil {
				return nil, err;
			}
			ping_packet_payload.Data = string(packet_payload_bytes);

			packet.Payload = ping_packet_payload;
		}
		case PacketKind_Pong:
		{
			var pong_packet_payload PacketPing;

			if err := binary.Read(buffer, binary.LittleEndian, &pong_packet_payload.DataLen); err != nil {
				return nil, err;
			}

			packet_payload_bytes := make([]byte, pong_packet_payload.DataLen);
			if err := binary.Read(buffer, binary.LittleEndian, &packet_payload_bytes); err != nil {
				return nil, err;
			}
			pong_packet_payload.Data = string(packet_payload_bytes);

			packet.Payload = pong_packet_payload;
		}
		case PacketKind_SpriteInfo:
		{
			var packet_payload PacketSpriteInfo;
			if err := binary.Read(buffer, binary.LittleEndian, &packet_payload.SourceFileLen); err != nil {
				return nil, err;
			}
			payload_bytes := make([]byte, packet_payload.SourceFileLen);
			if err := binary.Read(buffer, binary.LittleEndian, &payload_bytes); err != nil {
				return nil, err;
			}
			packet_payload.SourceFile = string(payload_bytes);
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
		origin := r.Header.Get("Origin")
		fmt.Printf("origin: %s\n", origin);
    return origin == "http://localhost:8000"
	},
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
			fmt.Print("Server received non binary message");
			continue;
		}
		data, err := io.ReadAll(reader);
		if (err != nil) {
			log.Fatal("failed to read data", err);
			break;
		}
		packet, err := Deserialize(data);
		if err != nil {
			log.Fatal("failed to deserialize packet\n", err);
			break;
		}
		fmt.Printf("Received packet: %+v\n", packet);

		switch packet.Kind {
			case PacketKind_Ping:
			{
				fmt.Print("sending pong\n");
				packet, err := PacketPongMake();
				if err != nil {
					fmt.Print("failed to make pong packet: \n", err);
					return;
				}

				fmt.Printf("sending packet: %+v\n", packet);
				buffer, err := packet.Serialize();
				if err != nil {
					fmt.Print("failed to serialize pong packet: \n", err);
					return;
				}
				socket.WriteMessage(websocket.BinaryMessage, buffer.Bytes());
			}
			case PacketKind_Pong:
			{
				fmt.Print("sending ping\n");
				packet, err := PacketPingMake();
				if err != nil {
					fmt.Print("failed to make ping packet: \n", err);
					return;
				}
				buffer, err := packet.Serialize();
				if err != nil {
					fmt.Print("failed to serialize ping packet: \n", err);
					return;
				}
				socket.WriteMessage(websocket.BinaryMessage, buffer.Bytes());
			}
			case PacketKind_SpriteInfo:
			{
				if payload, ok	:= packet.Payload.(PacketSpriteInfo); ok {

					items, err := database.QueryAllFromSourceFile(database.Pool, payload.SourceFile);
					if err != nil {
						fmt.Printf("%s\n", err);
						continue;
					}

					for _, item := range items {
						packet, err := PacketSpriteInfoMake(item);
						if err != nil {
							fmt.Printf("could not make packet %s\n", err);
							break;
						}
						fmt.Println("sending: ", packet);
						buffer, err := packet.Serialize();
						if err != nil {
							fmt.Print("failed to serialize packet\n", err);
							return;
						}
						socket.WriteMessage(websocket.BinaryMessage, buffer.Bytes());
					}
				}
			}
			default:
				fmt.Printf("unrecognized packet kind\n");
				socket.Close();
		}
	}
}

var addr = flag.String("addr", "localhost:8080", "http service address");
func StartServer() {
	http.HandleFunc("/", server);

	fmt.Println("Server running");
	log.Fatal(http.ListenAndServe(*addr, nil));
}
