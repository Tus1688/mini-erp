package models

import (
	"go-api/database"

	"gorm.io/gorm"
)

type TermOfPayment struct {
	ID      int    `gorm:"primary_key"`
	Name    string `gorm:"type:varchar(50);not null"`
	DueDate int    `gorm:"not null"`
}

type Invoice struct {
	ID              int      `gorm:"primary_key"`
	CustomerIDRefer int      `gorm:"not null"`
	Customer        Customer `gorm:"foreignkey:CustomerIDRefer"`
}

type InvoiceItem struct {
	InvoiceIDRefer int     `gorm:"not null"`
	ItemID         int     `gorm:"not null"`
	Quantity       int     `gorm:"not null"`
	Price          int     `gorm:"not null"`
	Discount       int     `gorm:"not null"`
	Total          int     `gorm:"not null"`
	Invoice        Invoice `gorm:"foreignkey:InvoiceIDRefer"`
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
