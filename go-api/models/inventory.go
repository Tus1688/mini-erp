package models

import (
	"go-api/database"
	"time"

	"gorm.io/gorm"
)

/*
after production, inventory user(production) will create batch (as production code)
create item based on variant and batch number
fill itemStock based on itemID (total of item)

@item = variant + batch
@itemStock = quantity of @item
*/

type Batch struct {
	ID          int `gorm:"primary_key"`
	CreatedAt   time.Time
	ExpiredDate time.Time
}

type Variant struct {
	ID          int    `gorm:"primary_key"`
	Name        string `gorm:"type:varchar(30);not null;unique"`
	Description string `gorm:"type:varchar(100);not null"`
	UpdatedAt   time.Time
}

type ItemTransactionLog struct {
	ID           int `gorm:"primary_key"`
	BatchRefer   int `gorm:"not null"`
	VariantRefer int `gorm:"not null"`
	Quantity     int `gorm:"not null"`
	CreatedAt    time.Time
	Batch        Batch   `gorm:"foreignkey:BatchRefer"`
	Variant      Variant `gorm:"foreignkey:VariantRefer"`
}

type ItemTransactionLogDraft struct {
	ID           int `gorm:"primary_key"`
	BatchRefer   int `gorm:"not null"`
	VariantRefer int `gorm:"not null"`
	Quantity     int `gorm:"not null"`
	CreatedAt    time.Time
	Batch        Batch   `gorm:"foreignkey:BatchRefer"`
	Variant      Variant `gorm:"foreignkey:VariantRefer"`
}

// sales invoice's item that hasn't been approved is put in this table
// so that we can delete the row if the sales invoice is rejected
type FinanceItemTransactionLogDraft struct {
	ID                int `gorm:"primary_key"`
	BatchRefer        int `gorm:"not null"`
	VariantRefer      int `gorm:"not null"`
	Quantity          int `gorm:"not null"`
	InvoiceDraftRefer int `gorm:"not null"`
	CreatedAt         time.Time
	Batch             Batch        `gorm:"foreignkey:BatchRefer"`
	Variant           Variant      `gorm:"foreignkey:VariantRefer"`
	InvoiceDraft      InvoiceDraft `gorm:"foreignkey:InvoiceDraftRefer"`
}

type APIInventoryBatchCreate struct {
	ExpiredDate time.Time `json:"expired_date" binding:"required"`
}

type APIInventoryBatchUpdate struct {
	ID          int       `json:"id" binding:"required"`
	ExpiredDate time.Time `json:"expired_date" binding:"required"`
}

type APIInventoryBatchResponse struct {
	ID          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiredDate time.Time `json:"expired_date"`
}

type APIInventoryVariantCreate struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type APIInventoryVariantResponse struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type APIInventoryVariantUpdate struct {
	ID          int    `json:"id" binding:"required"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type APIInventoryItemProductionCreate struct {
	BatchRefer   int `json:"batch_id" binding:"required"`
	VariantRefer int `json:"variant_id" binding:"required"`
	Quantity     int `json:"quantity" binding:"required"`
}

type APIInventoryItemProductionUpdate struct {
	ID           int `json:"id" binding:"required"`
	BatchRefer   int `json:"batch_id"`
	VariantRefer int `json:"variant_id"`
	Quantity     int `json:"quantity"`
}

type APIInventoryStockReponse struct {
	Name        string    `json:"variant_name"`
	ID          int       `json:"batch_id"`
	Quantity    int       `json:"quantity"`
	ExpiredDate time.Time `json:"expired_date"`
}

type APIInventoryTransactionLogResponse struct {
	ID         int       `json:"id"`
	BatchRefer int       `json:"batch_id"`
	Name       string    `json:"variant_name"`
	Quantity   int       `json:"quantity"`
	CreatedAt  time.Time `json:"created_at"`
}

func (t *Batch) BeforeCreate(tx *gorm.DB) (err error) {
	var current Batch
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	t.CreatedAt = time.Now()
	return
}

func (t *Variant) BeforeCreate(tx *gorm.DB) (err error) {
	var current Variant
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	t.UpdatedAt = time.Now()
	return
}

func (t *ItemTransactionLog) BeforeCreate(tx *gorm.DB) (err error) {
	var current ItemTransactionLog
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	t.CreatedAt = time.Now()
	return
}

func (t *ItemTransactionLogDraft) BeforeCreate(tx *gorm.DB) (err error) {
	var current ItemTransactionLogDraft
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	t.CreatedAt = time.Now()
	return
}

func (t *FinanceItemTransactionLogDraft) BeforeCreate(tx *gorm.DB) (err error) {
	// as we may create multiple item transaction log draft for one invoice draft
	// we don't need to get exact last id as it might be the same as the previous one (database locking)
	t.CreatedAt = time.Now()
	return
}
