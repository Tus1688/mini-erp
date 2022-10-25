package main

import (
	"go-api/auth"
	"go-api/controllers"
	"go-api/database"
	"go-api/middlewares"
	"go-api/models"
	"log"
	"os"

	"github.com/gin-gonic/contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	database.MysqlConnect()
	models.MigrateDB()

	router := initRouter()
	router.Run(":6000")
}

func loadEnv() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	auth.JwtKey = []byte(os.Getenv("JWT_KEY"))
}

func initRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middlewares.ValidateCsrf())

	api := router.Group("/api/v1")
	{
		api.POST("/customer", controllers.CreateCustomer)

		// geo controllers
		api.POST("/city", controllers.CreateCity)
		api.POST("/province", controllers.CreateProvince)
		api.POST("/country", controllers.CreateCountry)
	}

	return router
}
