package models

import (
	"go-api/database"
	"log"
)

func MigrateDB() {
	database.Instance.AutoMigrate(
		&Customer{},
		// geo
		&City{},
		&Province{},
		&Country{},
		// inventory
		&Batch{},
		&Variant{},
		&Item{},
		&ItemTransactionLog{},
	)
	log.Print("Migrated DB!")
}
