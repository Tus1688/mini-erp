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
		&ItemTransactionLog{},
		&ItemTransactionLogDraft{},
		// finance
		&TermOfPayment{},
		&InvoiceDraft{},
		&InvoiceItemDraft{},
		&FinanceItemTransactionLogDraft{},
	)
	log.Print("Migrated DB!")
}
