package main

import (
	"go-auth/auth"
	"go-auth/controllers"
	"go-auth/database"
	"go-auth/middlewares"
	"log"
	"os"

	"github.com/gin-gonic/contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	loadEnv()
	database.Connect()
	database.Migrate()
	database.InitAdminAccount()

	router := initRouter()
	router.Run(":5000")
}

func loadEnv() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	auth.JwtKey = []byte(os.Getenv("JWT_KEY"))
	log.Print("Loaded env!")
}

func initRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middlewares.AssignCsrf())
	router.Use(middlewares.AssignUser())
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
