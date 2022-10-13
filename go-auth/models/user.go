package models

import "golang.org/x/crypto/bcrypt"

type User struct {
	Username       string `gorm:"type:varchar(20);primaryKey" json:"username" binding:"required"`
	Password       string `gorm:"type:binary(60);not null" json:"password" binding:"required"`
	InventoryUser  *bool  `gorm:"not null" json:"inv_user" validate:"exists"`
	FinanceUser    *bool  `gorm:"not null" json:"fin_user" validate:"exists"`
	InventoryAdmin *bool  `gorm:"not null" json:"inv_admin" validate:"exists"`
	FinanceAdmin   *bool  `gorm:"not null" json:"fin_admin" validate:"exists"`
	SystemAdmin    *bool  `gorm:"not null" json:"sys_admin" validate:"exists"`
	Active         *bool  `gorm:"not null;index:active;default:true" validate:"exists"`
}

type UserLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (user *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return err
	}
	user.Password = string(bytes)
	return nil
}

func (user *User) CheckPassword(password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return err
	}
	return nil
}
