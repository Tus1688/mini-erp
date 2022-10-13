package main

import (
	"go-auth/controllers"
	"go-auth/database"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	database.Connect()
	database.Migate()

	router := initRouter()
	router.Run(":5000")
}

func loadEnv() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func initRouter() *gin.Engine {
	router := gin.Default()
	api := router.Group("/api/v1/auth")
	{
		api.POST("/register", controllers.RegisterUser)
		api.POST("/login", controllers.GenerateToken)
	}
	return router
}
