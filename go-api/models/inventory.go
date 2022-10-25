package models

import (
	"go-api/database"
	"time"

	"gorm.io/gorm"
)

type Batch struct {
	ID          int       `json:"id" gorm:"primary_key"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiredDate time.Time `json:"expired_date"`
}

type Item struct {
	ID           int    `json:"id" gorm:"primary_key"`
	Name         string `json:"name" gorm:"type:varchar(50);not null"`
	BatchIDRefer int    `json:"batch" gorm:"not null"`
	Batch        Batch  `gorm:"foreignkey:BatchIDRefer"`
}

func (t *Batch) BeforeCreate(tx *gorm.DB) (err error) {
	var current Batch
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	t.CreatedAt = time.Now()
	return
}

func (t *Item) BeforeCreate(tx *gorm.DB) (err error) {
	var current Item
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}
