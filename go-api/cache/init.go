package cache

import (
	"go-api/database"
	"go-api/models"
	"log"
)

func CountAllRows() {
	customer()
	variant()
	batch()
	productionDraft()
	termOfPayment()
	salesInvoice()
	salesInvoiceDraft()
}

func customer() {
	var count int64
	database.Instance.Table("customers").Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "customer_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}

func batch() {
	var count int64
	database.Instance.Table("batches").Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "batch_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}

func variant() {
	var count int64
	database.Instance.Table("variants").Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "variant_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}

func productionDraft() {
	var count int64
	database.Instance.Model(&models.ItemTransactionLogDraft{}).Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "production_draft_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}

func termOfPayment() {
	var count int64
	database.Instance.Model(&models.TermOfPayment{}).Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "term_of_payment_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}
func salesInvoice() {
	var count int64
	database.Instance.Model(&models.Invoice{}).Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "sales_invoice_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}

func salesInvoiceDraft() {
	var count int64
	database.Instance.Model(&models.InvoiceDraft{}).Count(&count)
	err := database.Rdb.Set(database.Rdb.Context(), "sales_invoice_draft_count", count, 0).Err()
	if err != nil {
		log.Print(err)
	}
}
