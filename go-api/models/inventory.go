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

type Item struct {
	ID           int     `gorm:"primary_key"`
	BatchRefer   int     `gorm:"not null"`
	VariantRefer int     `gorm:"not null"`
	Batch        Batch   `gorm:"foreignkey:BatchRefer"`
	Variant      Variant `gorm:"foreignkey:VariantRefer"`
}

type ItemTransactionLog struct {
	ID        int  `gorm:"primary_key"`
	ItemRefer int  `gorm:"not null"`
	Quantity  int  `gorm:"not null"`
	Item      Item `gorm:"foreignkey:ItemRefer"`
	CreatedAt time.Time
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

type APIInventoryItemCreate struct {
	BatchRefer   int `json:"batch_id" binding:"required"`
	VariantRefer int `json:"variant_id" binding:"required"`
}

type APIInventoryItemUpdate struct {
	ID           int `json:"id" binding:"required"`
	BatchRefer   int `json:"batch_id"`
	VariantRefer int `json:"variant_id"`
}

type APIInventoryItemProductionCreate struct {
	BatchRefer   int `json:"batch_refer" binding:"required"`
	VariantRefer int `json:"variant_refer" binding:"required"`
	Quantity     int `json:"quantity" binding:"required"`
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

func (t *Item) BeforeCreate(tx *gorm.DB) (err error) {
	var current Item
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}

func (t *ItemTransactionLog) BeforeCreate(tx *gorm.DB) (err error) {
	var current ItemTransactionLog
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	t.CreatedAt = time.Now()
	return
}