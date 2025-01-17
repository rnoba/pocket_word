package socket 

import (
	"bytes"
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var ANONYMOUS_ID	= uint64(0)
var SERVER_ID			= uint64(1)

const (
	PacketKind_LoadAsset	= 1 << 0
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
	Id		uint64
	Kind	uint32
	Name	[16]byte
}

type PacketPing struct {
	Data [16]byte
}

type PacketPong struct {
	Data [16]byte
}

type Packet struct {
	Size	uint32
	Kind	uint32
	Agent Agent
	Payload interface{}
}

func AgentAnonymousMake() Agent {
	agent := Agent{
		Name: [16]byte{'A', 'N', 'O', 'N', 'Y', 'M', 'O', 'U', 'S', 0},
		Id:		ANONYMOUS_ID,
		Kind: AgentKind_Anonymous,
	}
	return (agent);
}

func AgentServerMake() Agent {
	agent := Agent{
		Name: [16]byte{'S', 'E', 'R', 'V', 'E', 'R', 0},
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
			Data: [16]byte{'p', 'o', 'n', 'g', 0},
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
		return nil, err
	}
	if err := binary.Write(buffer, binary.LittleEndian, &packet.Kind); err != nil {
		return nil, err
	}
	if err := binary.Write(buffer, binary.LittleEndian, &packet.Agent); err != nil {
		return nil, err
	}
	switch p := packet.Payload.(type) {
		case PacketPong:
			if err := binary.Write(buffer, binary.LittleEndian, p); err != nil {
				return nil, err;
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
	if err := binary.Read(buffer, binary.LittleEndian, &packet.Agent); err != nil {
		return nil, err;
	}
	switch packet.Kind {
		case PacketKind_Ping:
		{
			var ping_packet PacketPing;
			if err := binary.Read(buffer, binary.LittleEndian, &ping_packet); err != nil {
				return nil, err;
			}
			packet.Payload = ping_packet;
		}
		case PacketKind_LoadAsset:
			log.Panicf("UNINPLEMENTED");
		case PacketKind_Pong:
			fmt.Printf("server received pong packet???\n");
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
				pong_packet, err := PacketPongMake();
				if err != nil {
					fmt.Print("failed to make pong message: \n", err);
					return;
				}
				fmt.Printf("Sending packet: %+v\n", pong_packet);
				buffer, err := pong_packet.Serialize();
				if err != nil {
					fmt.Print("failed to serialize pong message: \n", err);
					return;
				}
				socket.WriteMessage(websocket.BinaryMessage, buffer.Bytes());
			}
			case PacketKind_LoadAsset:
				log.Panicf("UNINPLEMENTED");
			case PacketKind_Pong:
				fmt.Printf("server received pong packet???\n");
				socket.Close();
			default:
				fmt.Printf("unrecognized packet kind\n");
				socket.Close();
		}
	}
}

var addr = flag.String("addr", "localhost:8080", "http service address");
func StartServer() {
	http.HandleFunc("/", server);
	log.Fatal(http.ListenAndServe(*addr, nil));
}
