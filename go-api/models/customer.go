package models

import (
	"go-api/database"

	"gorm.io/gorm"
)

type Customer struct {
	ID        int    `gorm:"primary_key"`
	Name      string `gorm:"type:varchar(50);not null;unique"`
	TaxID     string `gorm:"type:varchar(16);not null"`
	Address   string `gorm:"type:varchar(100);not null"`
	CityRefer int    `gorm:"not null"`
	City      City   `gorm:"foreignkey:CityRefer"`
}

type APICustomerCreate struct {
	Name    string `json:"name" binding:"required"`
	TaxID   string `json:"tax_id" binding:"required"`
	Address string `json:"address" binding:"required"`
	City    int    `json:"city_id" binding:"required"`
}

type APICustomerUpdate struct {
	ID      int    `json:"id" binding:"required"`
	Name    string `json:"name"`
	TaxID   string `json:"tax_id"`
	Address string `json:"address"`
	City    int    `json:"city_id"`
}

type APICustomerResponseSpecific struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	TaxID        string `json:"tax_id"`
	Address      string `json:"address"`
	CityName     string `json:"city_name"`
	ProvinceName string `json:"province_name"`
	CountryName  string `json:"country_name"`
}

type APICustomerResponse struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	TaxID   string `json:"tax_id"`
	Address string `json:"address"`
}

func (t *Customer) BeforeCreate(tx *gorm.DB) (err error) {
	var current Customer
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}
