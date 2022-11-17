package models

import (
	"go-api/database"
	"log"
)

func MigrateDB() {
	database.Instance.AutoMigrate(
		&Customer{},
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
		&Invoice{},
		&InvoiceItem{},
	)
	log.Print("Migrated DB!")
}
