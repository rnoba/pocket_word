package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id uint64;
	Username string;
	PasswordHash	[]byte; 
	IsAdmin		bool;
	CreatedAt time.Time;
}

func HashPassword(password_string string) ([]byte, error) {
	password_hash, err := bcrypt.GenerateFromPassword([]byte(password_string), bcrypt.DefaultCost);
	if err != nil {
		return nil, fmt.Errorf("Failed to hash password: %v", err);
	}
	return password_hash, nil;
}

func CheckPasswordHash(password_hash []byte, password_string string) bool {
	return bcrypt.CompareHashAndPassword(password_hash, []byte(password_string)) == nil;
}

func UserByUsername(pool *pgxpool.Pool, username string) (*User, error) {
	if pool == nil {
		return nil, fmt.Errorf("Pool not initialized");
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second);
	defer cancel();

	row := pool.QueryRow(ctx, `
		SELECT * 
		FROM users 
		WHERE username = $1
		`, username);

	user := new(User); 
	if err := row.Scan(&user.Id,
										&user.Username,
										&user.PasswordHash,
										&user.IsAdmin,
										&user.CreatedAt); err != nil {
		return nil, fmt.Errorf("row scan failed: %v", err);
	}

	return user, nil;
}

func UserById(pool *pgxpool.Pool, id uint64) (*User, error) {
	if pool == nil {
		return nil, fmt.Errorf("Pool not initialized");
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second);
	defer cancel();

	row := pool.QueryRow(ctx, `
		SELECT * 
		FROM users 
		WHERE id = $1
		`, id);

	user := new(User); 
	if err := row.Scan(&user.Id,
										&user.Username,
										&user.PasswordHash,
										&user.IsAdmin,
										&user.CreatedAt); err != nil {
		return nil, fmt.Errorf("row scan failed: %v", err);
	}

	return user, nil;
}


func CreateUser(
	pool *pgxpool.Pool,
	username string,
	password_hash []byte) (*User, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second);
	defer cancel();

	tx, err := pool.Begin(ctx);
	if err != nil {
		log.Fatalf("Failed to begin transaction: %v", err);
	}

	defer func() {
		if p := recover(); p != nil || err != nil {
			_ = tx.Rollback(ctx)
			log.Fatalf("Transaction rolled back: %v", err)
		}
	}()

	user_query := `INSERT INTO users (username, password_hash) VALUES ($1, $2)
								 RETURNING id, username, password_hash, is_admin, created_at;`

	user := new(User);
	user_err := tx.QueryRow(ctx, user_query, username, password_hash).Scan(
		&user.Id,
		&user.Username,
    &user.PasswordHash,
    &user.IsAdmin,
    &user.CreatedAt,
	);

	if user_err != nil {
		_ = tx.Rollback(ctx);
		return nil, fmt.Errorf("Failed to insert user: %v", user_err);
	}

	inventory_query := `INSERT INTO user_inventory (user_id, data) VALUES ($1, $2);`
	_, inv_err := tx.Exec(ctx, inventory_query, user.Id, []byte{});

	if inv_err != nil {
		_ = tx.Rollback(ctx);
		return nil, fmt.Errorf("Failed to insert inventory for user %d: %v", user.Id, inv_err);
	}

	err = tx.Commit(ctx);
	if err != nil {
		return nil, fmt.Errorf("Failed to commit transaction: %v", err);
	}

	return user, nil;
}
