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
	router.Use(middlewares.ValidateCsrf())

	api := router.Group("/api/v1/auth")
	{
		api.POST("/login", controllers.GenerateToken)
		admin := api.Group("/admin")
		admin.Use(middlewares.TokenExpired(10))
		admin.Use(middlewares.EnforceCsrf())
		{
			admin.POST("/register", controllers.RegisterUser)
			admin.POST("/reset-password", controllers.AdminChangePassword)
			admin.PUT("/toggle-active", controllers.AdminToggleActive)
		}
		user := api.Group("/user")
		user.Use(middlewares.TokenExpired(10))
		user.Use(middlewares.EnforceCsrf())
		{
			user.POST("/changepw", controllers.ChangePasswordUser)
		}
	}
	return router
}
