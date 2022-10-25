package main

import (
	"go-api/auth"
	"go-api/controllers"
	"go-api/database"
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
	// router.Use(middlewares.ValidateCsrf())
	// router.Use(middlewares.TokenExpired(60))

	api := router.Group("/api/v1")
	{
		api.POST("/customer", controllers.CreateCustomer)

		geo := api.Group("/geo")
		{
			geo.POST("/city", controllers.CreateCity)
			geo.POST("/province", controllers.CreateProvince)
			geo.POST("/country", controllers.CreateCountry)

			geo.DELETE("/city", controllers.DeleteCity)
			geo.DELETE("/province", controllers.DeleteProvince)
			geo.DELETE("/country", controllers.DeleteCountry)
		}
	}

	return router
}
