package models

import (
	"go-api/database"

	"gorm.io/gorm"
)

type TermOfPayment struct {
	ID        int    `gorm:"primary_key"`
	Name      string `gorm:"type:varchar(50);not null"`
	DueDate   int    `gorm:"not null"`
	CreatedBy string `gorm:"type:varchar(20);not null"`
}

type Invoice struct {
	ID            int           `gorm:"primary_key"`
	TOPRefer      int           `gorm:"not null"`
	CustomerRefer int           `gorm:"not null"`
	CreatedBy     string        `gorm:"type:varchar(20);not null"`
	Customer      Customer      `gorm:"foreignkey:CustomerRefer"`
	TermOfPayment TermOfPayment `gorm:"foreignkey:TOPRefer"`
}

type InvoiceItem struct {
	InvoiceRefer int     `gorm:"not null"`
	ItemRefer    int     `gorm:"not null"`
	Quantity     int     `gorm:"not null"`
	Price        int     `gorm:"not null"`
	Discount     int     `gorm:"not null"`
	Total        int     `gorm:"not null"`
	Invoice      Invoice `gorm:"foreignkey:InvoiceRefer"`
	Item         Item    `gorm:"foreignkey:ItemRefer"`
}

type InvoiceDraft struct {
	ID            int           `gorm:"primary_key"`
	TOPRefer      int           `gorm:"not null"`
	CustomerRefer int           `gorm:"not null"`
	CreatedBy     string        `gorm:"type:varchar(20);not null"`
	Customer      Customer      `gorm:"foreignkey:CustomerRefer"`
	TermOfPayment TermOfPayment `gorm:"foreignkey:TOPRefer"`
}

type InvoiceItemDraft struct {
	InvoiceDraftRefer int     `gorm:"not null"`
	ItemRefer         int     `gorm:"not null"`
	Quantity          int     `gorm:"not null"`
	Price             int     `gorm:"not null"`
	Discount          int     `gorm:"not null"`
	Total             int     `gorm:"not null"`
	InvoiceDraft      Invoice `gorm:"foreignkey:InvoiceDraftRefer"`
	Item              Item    `gorm:"foreignkey:ItemRefer"`
}

func (t *TermOfPayment) BeforeCreate(tx *gorm.DB) (err error) {
	var current TermOfPayment
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}

func (t *Invoice) BeforeCreate(tx *gorm.DB) (err error) {
	var current Invoice
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}

func (t *InvoiceDraft) BeforeCreate(tx *gorm.DB) (err error) {
	var current InvoiceDraft
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}
