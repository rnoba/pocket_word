package database

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
	"time"


	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type InventoryItem struct {
	ItemID   uint64;
	Quantity uint16;
}

type Inventory struct {
	Items []InventoryItem;
}

func EncodeInventory(inventory Inventory) []byte {
	buf := new(bytes.Buffer);
	for _, item := range inventory.Items {
			binary.Write(buf, binary.LittleEndian, item.ItemID);
			binary.Write(buf, binary.LittleEndian, item.Quantity);
	}
	return buf.Bytes();
}

func DecodeInventory(data []byte) Inventory {
	buf := bytes.NewReader(data);
	inventory := Inventory{};

	for buf.Len() > 0 {
		var item InventoryItem;
		binary.Read(buf, binary.LittleEndian, &item.ItemID);
		binary.Read(buf, binary.LittleEndian, &item.Quantity);
		inventory.Items = append(inventory.Items, item);
	}
	return inventory;
}

func UserInventoryAddItem(pool *pgxpool.Pool, user_id uint64, item InventoryItem) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second);
	defer cancel();

	return ExecuteWithTransaction(ctx, pool, func(tx pgx.Tx) error {
		inv_query := `SELECT data FROM user_inventory WHERE user_id = $1`;

		var inv_data []byte;
		if inv_err := tx.QueryRow(ctx, inv_query, user_id).Scan(&inv_data); inv_err != nil {
			return fmt.Errorf("Failed to retrieve user inventory: %v", inv_err);
		}

		inventory := DecodeInventory(inv_data);
		increment := false;
		for _, inv_item := range inventory.Items {
			if inv_item.ItemID == item.ItemID {
				increment = true;
				inv_item.Quantity += 1;
				break;
			}
		}
		if !increment {
			inventory.Items = append(inventory.Items, item);
		}
		encoded := EncodeInventory(inventory);

		update_query := `UPDATE user_inventory SET data = $1 WHERE user_id = $2;`
		if _, err := tx.Exec(ctx, update_query, encoded, user_id); err != nil {
			return fmt.Errorf("Failed to save user inventory: %v", err);
		}
		return nil;
	});
}

func SaveInventory(pool *pgxpool.Pool, user_id uint64, data []byte) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second);
	defer cancel();

	return ExecuteWithTransaction(ctx, pool, func(tx pgx.Tx) error {
		inv_query := `UPDATE user_inventory SET data = $1 WHERE user_id = $2;`

		if _, err := tx.Exec(ctx, inv_query, data, user_id); err != nil {
			return fmt.Errorf("Failed to save user inventory: %v", err);
		}
		return nil;
	});
}
