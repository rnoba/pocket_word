package main

import (
	"github.com/rnoba/pocket_world/server/database"
	"github.com/rnoba/pocket_world/server/socket"
)

func main() {
	database.CreateTables();
	database.DatabasePoolInit();
	server.StartServer();
}
