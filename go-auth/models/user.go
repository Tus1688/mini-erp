package models

import "golang.org/x/crypto/bcrypt"

type User struct {
	Username       string `gorm:"type:varchar(20);primaryKey" json:"username" binding:"required"`
	Password       string `gorm:"type:binary(60);not null" json:"password" binding:"required"`
	InventoryUser  *bool  `gorm:"not null" json:"inv_user" binding:"required"`
	FinanceUser    *bool  `gorm:"not null" json:"fin_user" binding:"required"`
	FinanceAdmin   *bool  `gorm:"not null" json:"fin_admin" binding:"required"`
	InventoryAdmin *bool  `gorm:"not null" json:"inv_admin" binding:"required"`
	SystemAdmin    *bool  `gorm:"not null" json:"sys_admin" binding:"required"`
	Active         *bool  `gorm:"not null;index:active;default:true"`
}

type UserLogin struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserForgotPassword struct {
	Password    string `json:"password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type AdminChangePassword struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AdminToggleActiveStatus struct {
	Username string `json:"username" binding:"required"`
	Active   *bool  `json:"active" binding:"required"`
}

type AdminPatchUserRole struct {
	Username       string `json:"username" binding:"required"`
	InventoryUser  *bool  `json:"inv_user"`
	FinanceUser    *bool  `json:"fin_user"`
	FinanceAdmin   *bool  `json:"fin_admin"`
	InventoryAdmin *bool  `json:"inv_admin"`
	SystemAdmin    *bool  `json:"sys_admin"`
}

type AdminResponseUser struct {
	Username       string `json:"username"`
	InventoryUser  bool   `json:"inv_user"`
	FinanceUser    bool   `json:"fin_user"`
	FinanceAdmin   bool   `json:"fin_admin"`
	InventoryAdmin bool   `json:"inv_admin"`
	SystemAdmin    bool   `json:"sys_admin"`
	Active         bool   `json:"active"`
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
