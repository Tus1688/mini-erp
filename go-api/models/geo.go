package models

type City struct {
	ID       int    `json:"id" gorm:"primary_key"`
	CityName string `json:"city_name" gorm:"type:varchar(50);not null"`
}

type Country struct {
	ID          int    `json:"id" gorm:"primary_key"`
	CountryName string `json:"country_name" gorm:"type:varchar(50);not null"`
}
