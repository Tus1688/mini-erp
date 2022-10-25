package models

import (
	"go-api/database"

	"gorm.io/gorm"
)

type TermOfPayment struct {
	ID      int    `json:"id" gorm:"primary_key"`
	Name    string `json:"name" gorm:"type:varchar(50);not null"`
	DueDate int    `json:"due_date" gorm:"not null"`
}

type Invoice struct {
	ID              int      `json:"id" gorm:"primary_key"`
	CustomerIDRefer int      `json:"customer" gorm:"not null"`
	Customer        Customer `gorm:"foreignkey:CustomerIDRefer"`
}

type InvoiceItem struct {
	InvoiceIDRefer int     `json:"invoice" gorm:"not null"`
	ItemID         int     `json:"item" gorm:"not null"`
	Quantity       int     `json:"quantity" gorm:"not null"`
	Price          int     `json:"price" gorm:"not null"`
	Discount       int     `json:"discount" gorm:"not null"`
	Total          int     `json:"total" gorm:"not null"`
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
