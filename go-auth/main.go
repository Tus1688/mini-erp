package main

import (
	"go-auth/controllers"
	"go-auth/database"
	"go-auth/middlewares"
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
		api.POST("/login", controllers.GenerateToken)
		secured := api.Group("/admin").Use(middlewares.Auth(1)) // 1 minute expired
		{
			secured.POST("/register", controllers.RegisterUser)
		}
	}
	return router
}
