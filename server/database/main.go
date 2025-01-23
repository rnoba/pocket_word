package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool;

func DatabasePoolInit() {
	dsn					:= os.Getenv("DATABASE_URL");
	config, err := pgxpool.ParseConfig(dsn);
	if err != nil {
		log.Fatalf("Unable to parse config: %v", err);
	}

	config.MaxConns = 30;
	config.MinConns = 5;
	config.MaxConnLifetime		= 30 * time.Minute;
	config.HealthCheckPeriod	= 01 * time.Minute;

	Pool, err = pgxpool.NewWithConfig(context.Background(), config);
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err);
	}

	log.Println("Database pool initialized!");
}

func DatabasePoolDeinit() {
	Pool.Close();
	log.Println("Database pool closed!");
}

func ExecuteWithTransaction(ctx context.Context, pool *pgxpool.Pool, fn func(tx pgx.Tx) error) error {
	tx, err := pool.Begin(ctx);
	if err != nil {
		return fmt.Errorf("Failed to begin transaction: %v", err);
	}

	defer func() {
		if p := recover(); p != nil || err != nil {
			_ = tx.Rollback(ctx);
			if p != nil {
				panic(p);
			}
		}
	}();

	err = fn(tx);
	if err != nil {
		return fmt.Errorf("Error during transaction: %v", err);
	}

	err = tx.Commit(ctx);
	if err != nil {
		return fmt.Errorf("Failed to commit transaction: %v", err)
	}

	return nil;
}

func CreateTables() {
	dsn				:= os.Getenv("DATABASE_URL");
	conn, err := pgx.Connect(context.Background(), dsn); 
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}

	defer conn.Close(context.Background());

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second);
	defer cancel();

	tx, err := conn.Begin(ctx);
	if err != nil {
		log.Fatalf("Failed to begin transaction: %v", err);
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx);
			log.Fatalf("Transaction rolled back: %v", err);
		}
	}()

	queries := []string {
		`CREATE TABLE IF NOT EXISTS items (
			id SERIAL PRIMARY KEY,
			source_file varchar(255),
			description varchar(255),
			name				varchar(255),
			offset_x		INT,
			offset_y		INT,
			width				INT,
			height			INT,
			created_at	TIMESTAMPTZ DEFAULT now()
		);`,
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL			PRIMARY KEY,
			username			varchar(255) UNIQUE,
			password_hash BYTEA NOT NULL,
			is_admin			BOOLEAN NOT NULL DEFAULT FALSE,
			created_at		TIMESTAMPTZ DEFAULT now()
		);`,
		`ALTER SEQUENCE users_id_seq RESTART WITH 2;`,
		`CREATE TABLE IF NOT EXISTS user_inventory (
			user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			data BYTEA NOT NULL,
			PRIMARY KEY (user_id)
		);`,
	};

	for _, query := range queries{
		_, err = tx.Exec(ctx, query)
		if err != nil {
			log.Printf("Failed to execute query: %s", query)
			return;
		}
	}

	err = tx.Commit(ctx);
	if err != nil {
		log.Fatalf("Failed to commit transaction: %v", err);
	}

	log.Println("Migrations applied successfully!");
}
