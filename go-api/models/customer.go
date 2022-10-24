package models

type Customer struct {
	ID           int     `json:"id" gorm:"primary_key"`
	Name         string  `json:"name" gorm:"type:varchar(50);not null"`
	Address      string  `json:"address" gorm:"type:varchar(100);not null"`
	CityRefer    int     `json:"city" gorm:"not null"`
	CountryRefer int     `json:"country" gorm:"not null"`
	City         City    `gorm:"foreignkey:CityRefer"`
	Country      Country `gorm:"foreignkey:CountryRefer"`
}
