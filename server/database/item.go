package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreateItem(
	pool *pgxpool.Pool,
	source_file string,
	offset_x int32, offset_y int32,
	width int32, height int32,
	description string, name string) error {

	if pool == nil {
		return fmt.Errorf("Pool was not initialized");
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second);
	defer cancel();

	tx, err := pool.Begin(ctx);
	if err != nil {
		return err;
	}

	defer func() {
		if err != nil {
			log.Fatalf("Query rolled back: %v", err);
			_ = tx.Rollback(ctx);
		}
	}();

	_, err = tx.Exec(
		ctx,
		`INSERT INTO items (source_file, offset_x, offset_y, width, height, description, name) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		source_file,
		offset_x, offset_y,
		width, height,
		description, name,
	);

	if err != nil {
		log.Printf("Failed to execute query: %s", err)
		return err;
	}

	err = tx.Commit(ctx);
	log.Println("Query applied successfully!");
	return err;
};

type Item struct {
	Id					uint64;
	OffsetX			int32;
	OffsetY			int32;
	Width				int32;
	Height			int32;
	SourceFile	string;
	Description	string;
	Name				string;
	CreatedAt		time.Time;
}

func QueryAllItems(pool *pgxpool.Pool) ([]Item, error) {
	if pool == nil {
		return nil, fmt.Errorf("Pool was not initialized");
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second);
	defer cancel();

	tx, err := pool.Begin(ctx);
	if err != nil {
		return nil, err;
	}

	defer func() {
		if err != nil {
			log.Fatalf("Query rolled back: %v", err);
			_ = tx.Rollback(ctx);
		}
	}();

	rows, err := tx.Query(ctx, `SELECT * from items`);
	if err != nil {
		log.Printf("Failed to execute query: %s", err)
		return nil, err;
	}
	defer rows.Close();
	var items []Item;
	for rows.Next() {
		var item Item;
		if err := rows.Scan(&item.Id,
												&item.SourceFile,
												&item.OffsetX,
												&item.OffsetY,
												&item.Width,
												&item.Height,
												&item.CreatedAt); err != nil {
			return nil, fmt.Errorf("row scan failed: %v", err);
		}
		items = append(items, item);
	}
	 if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %v", err);
	}
	return items, nil;
};

func QueryAllFromSourceFile(pool *pgxpool.Pool, source_file string) ([]Item, error) {
	if pool == nil {
		return nil, fmt.Errorf("Pool not initialized");
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second);
	defer cancel();

	rows, err := pool.Query(ctx, `
		SELECT id, source_file, description, name, offset_x, offset_y, width, height, created_at 
		FROM items 
		WHERE source_file = $1
		`, source_file);

	if err != nil {
		log.Printf("Failed to execute query: %s", err);
		return nil, err;
	}
	defer rows.Close();

	var items []Item;
	for rows.Next() {
		var item Item;
		if err := rows.Scan(&item.Id,
												&item.SourceFile,
												&item.Description,
												&item.Name,
												&item.OffsetX,
												&item.OffsetY,
												&item.Width,
												&item.Height,
												&item.CreatedAt); err != nil {
			return nil, fmt.Errorf("row scan failed: %v", err);
		}
		items = append(items, item);
	}
	 if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %v", err);
	}
	return items, nil;
};
