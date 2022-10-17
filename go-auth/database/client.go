package database

import (
	"fmt"
	"go-auth/models"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Instance *gorm.DB
var dbError error

func Connect() {
	DbHost := os.Getenv("DB_HOST")
	DbUser := os.Getenv("DB_USER")
	DbPassword := os.Getenv("DB_PASSWORD")
	DbName := os.Getenv("DB_NAME")
	DbPort := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", DbUser, DbPassword, DbHost, DbPort, DbName)
	Instance, dbError = gorm.Open(mysql.Open(dsn), &gorm.Config{
		PrepareStmt: true,
	})

	sqlDB, err := Instance.DB()
	if err != nil {
		panic(err)
	}
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(100)

	if dbError != nil {
		panic(dbError)
	}
	log.Printf("Connected to DB!")
}

func Migrate() {
	Instance.AutoMigrate(&models.User{})
	log.Printf("Migrated DB!")
}

func boolPointer(b bool) *bool {
	return &b
}

func InitAdminAccount() {
	var user models.User
	Instance.Where("username = ?", "admin").Delete(&user)
	bytes, err := bcrypt.GenerateFromPassword([]byte(os.Getenv("ADMIN_PASSWORD")), 10)
	if err != nil {
		panic(err)
	}
	password := string(bytes)
	Instance.FirstOrCreate(&user, models.User{
		Username:       "admin",
		Password:       password,
		InventoryUser:  boolPointer(true),
		FinanceUser:    boolPointer(true),
		InventoryAdmin: boolPointer(true),
		SystemAdmin:    boolPointer(true),
		Active:         boolPointer(true),
	})
	log.Printf("Successfully created admin account!")
}
