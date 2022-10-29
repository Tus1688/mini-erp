package models

import (
	"go-api/database"
	"time"

	"gorm.io/gorm"
)

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
	Batch        Batch   `gorm:"foreignkey:BatchRefer"`
	VariantRefer int     `gorm:"not null"`
	Variant      Variant `gorm:"foreignkey:VariantRefer"`
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
