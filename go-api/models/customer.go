package models

import (
	"go-api/database"

	"gorm.io/gorm"
)

type Customer struct {
	ID        int    `gorm:"primary_key"`
	Name      string `json:"name" gorm:"type:varchar(50);not null"`
	TaxID     string `json:"tax_id" gorm:"type:varchar(16);not null"`
	Address   string `json:"address" gorm:"type:varchar(100);not null"`
	CityRefer int    `json:"city" gorm:"not null"`
	City      City   `gorm:"foreignkey:CityRefer"`
}

func (t *Customer) BeforeCreate(tx *gorm.DB) (err error) {
	var current Customer
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}
