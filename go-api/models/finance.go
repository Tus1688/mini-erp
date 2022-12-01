package models

import (
	"go-api/database"
	"time"

	"gorm.io/gorm"
)

type TermOfPayment struct {
	ID        int    `gorm:"primary_key"`
	Name      string `gorm:"type:varchar(50);not null;unique"`
	DueDate   int    `gorm:"not null"`
	CreatedBy string `gorm:"type:varchar(20);not null"`
}

type Invoice struct {
	ID            int           `gorm:"primary_key"`
	TOPRefer      int           `gorm:"not null"`
	CustomerRefer int           `gorm:"not null"`
	Date          time.Time     `gorm:"not null"`
	CreatedBy     string        `gorm:"type:varchar(20);not null"`
	Customer      Customer      `gorm:"foreignkey:CustomerRefer"`
	TermOfPayment TermOfPayment `gorm:"foreignkey:TOPRefer"`
}

type InvoiceItem struct {
	InvoiceRefer int     `gorm:"not null"`
	BatchRefer   int     `gorm:"not null"`
	VariantRefer int     `gorm:"not null"`
	Quantity     int     `gorm:"not null"`
	Price        int     `gorm:"not null"`
	Discount     int     `gorm:"not null"`
	Total        int     `gorm:"not null"`
	Invoice      Invoice `gorm:"foreignkey:InvoiceRefer"`
	Batch        Batch   `gorm:"foreignkey:BatchRefer"`
	Variant      Variant `gorm:"foreignkey:VariantRefer"`
}

type InvoiceDraft struct {
	ID            int           `gorm:"primary_key"`
	TOPRefer      int           `gorm:"not null"`
	CustomerRefer int           `gorm:"not null"`
	Date          time.Time     `gorm:"not null"`
	CreatedBy     string        `gorm:"type:varchar(20);not null"`
	Customer      Customer      `gorm:"foreignkey:CustomerRefer"`
	TermOfPayment TermOfPayment `gorm:"foreignkey:TOPRefer"`
}

type InvoiceItemDraft struct {
	InvoiceDraftRefer int          `gorm:"not null"`
	BatchRefer        int          `gorm:"not null"`
	VariantRefer      int          `gorm:"not null"`
	Quantity          int          `gorm:"not null"`
	Price             int          `gorm:"not null"`
	Discount          int          `gorm:"not null"`
	Total             int          `gorm:"not null"`
	InvoiceDraft      InvoiceDraft `gorm:"foreignkey:InvoiceDraftRefer"`
	Batch             Batch        `gorm:"foreignkey:BatchRefer"`
	Variant           Variant      `gorm:"foreignkey:VariantRefer"`
}

// Items will be inserted to InvoiceItem
type Items struct {
	BatchRefer   int `json:"batch_id" binding:"required"`
	VariantRefer int `json:"variant_id" binding:"required"`
	Quantity     int `json:"quantity" binding:"required"`
	Price        int `json:"price" binding:"required"`
	Discount     int `json:"discount" binding:"required"`
}

type ItemsResponse struct {
	Name        string `json:"name"` // variant.name
	BatchRefer  int    `json:"batch_id"`
	Description string `json:"description"` // variants.description
	Price       int    `json:"price"`
	Discount    int    `json:"discount"`
	Quantity    int    `json:"quantity"`
	Total       int    `json:"total"`
}

type APIFinanceInvoiceResponseSpecific struct {
	ID        int             `json:"id"`
	TOPName   string          `json:"top_name"`
	CustName  string          `json:"customer_name"` // customers.name
	Date      time.Time       `json:"date"`
	CreatedBy string          `json:"created_by"`
	Total     int             `json:"total"` // total from foreach []ItemsResponse.Total
	Items     []ItemsResponse `json:"items"`
}

type APIFinanceInvoiceResponse struct {
	ID        int       `json:"id"`
	TOPName   string    `json:"top_name"`
	CustName  string    `json:"customer_name"` // customers.name
	Date      time.Time `json:"date"`
	CreatedBy string    `json:"created_by"`
	Total     int       `json:"total"` // total from foreach []ItemsResponse.Total
}

type APIFinanceInvoiceCreate struct {
	TOPRefer      int       `json:"top_id" binding:"required"`
	CustomerRefer int       `json:"customer_id" binding:"required"`
	Date          time.Time `json:"date" binding:"required"`
	Items         []Items   `json:"items" binding:"required"`
}

type APIFinanceTOPCreate struct {
	Name    string `json:"name" binding:"required"`
	DueDate int    `json:"due_date" binding:"required"`
}

// for update request & get response
type APIFinanceTOP struct {
	ID      int    `json:"id" binding:"required"`
	Name    string `json:"name"`
	DueDate int    `json:"due_date"`
}

type APIFinanceTotalRevenueCurrentWeek struct {
	Date  time.Time `json:"date"`
	Total int       `json:"total"`
}

type APIFinanceMonthlyProductionAndSales struct {
	Date               time.Time `json:"date"`
	ProductionQuantity int       `json:"production"`
	SalesQuantity      int       `json:"sales"`
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
