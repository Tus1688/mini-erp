package models

import (
	"go-api/database"
	"log"
)

func MigrateDB() {
	database.Instance.AutoMigrate(
		&Customer{},
		&City{},
		&Province{},
		&Country{},
	)
	log.Print("Migrated DB!")
}
