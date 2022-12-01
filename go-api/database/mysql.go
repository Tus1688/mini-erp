package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Instance *gorm.DB
var dbError error

func MysqlConnect() {
	DbHost := os.Getenv("DB_HOST")
	Dbuser := os.Getenv("DB_USER")
	DbPassword := os.Getenv("DB_PASSWORD")
	DbName := os.Getenv("DB_NAME")
	DbPort := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=UTC", Dbuser, DbPassword, DbHost, DbPort, DbName)
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
	log.Printf("Connected to DB")
}
