package models

import (
	"go-api/database"

	"gorm.io/gorm"
)

type City struct {
	ID            int      `gorm:"primary_key"`
	CityName      string   `json:"city_name" gorm:"type:varchar(50);not null;unique"`
	ProvinceRefer int      `json:"province_id" gorm:"not null"`
	Province      Province `gorm:"foreignkey:ProvinceRefer"`
}

type Province struct {
	ID           int     `gorm:"primary_key"`
	ProvinceName string  `json:"province_name" gorm:"type:varchar(50);not null;unique"`
	CountryRefer int     `json:"country_id" gorm:"not null"`
	Country      Country `gorm:"foreignkey:CountryRefer"`
}

type Country struct {
	ID          int    `gorm:"primary_key"`
	CountryName string `json:"country_name" gorm:"type:varchar(50);not null;unique"`
}

type ApiGeoDelete struct {
	ID int `json:"id" binding:"required"`
}

type APICityCreate struct {
	CityName   string `json:"city_name" binding:"required"`
	ProvinceID int    `json:"province_id" binding:"required"`
}

type APIProvinceCreate struct {
	ProvinceName string `json:"province_name" binding:"required"`
	CountryID    int    `json:"country_id" binding:"required"`
}

func (t *City) BeforeCreate(tx *gorm.DB) (err error) {
	var current City
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}

func (t *Province) BeforeCreate(tx *gorm.DB) (err error) {
	var current Province
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}

func (t *Country) BeforeCreate(tx *gorm.DB) (err error) {
	var current Country
	database.Instance.Last(&current)
	t.ID = current.ID + 1
	return
}
