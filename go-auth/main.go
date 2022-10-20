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
	database.MysqlConnect()
	database.RedisConnect()
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
	router.Use(middlewares.AssignCsrf())   // assign CSRF token to cookie
	router.Use(middlewares.ValidateCsrf()) // validate CSRF token

	api := router.Group("/api/v1/auth")
	{
		api.POST("/login", controllers.Login) // login
		admin := api.Group("/admin")
		admin.Use(middlewares.TokenExpired(10)) // expire token after 10 minutes
		admin.Use(middlewares.EnforceCsrf())    // enforce CSRF_token cookie == CSRF_token in JWT
		admin.Use(middlewares.UserIsSysAdmin()) // user must be system admin
		{
			admin.POST("/register", controllers.RegisterUser)              // register new user
			admin.POST("/reset-password", controllers.AdminChangePassword) // reset user password
			admin.PUT("/toggle-active", controllers.AdminToggleActive)     // toggle user active status
		}
		user := api.Group("/user")
		user.Use(middlewares.TokenExpired(10)) // expire token after 10 minutes
		user.Use(middlewares.EnforceCsrf())    // enforce CSRF_token cookie == CSRF_token in JWT
		{
			user.POST("/changepw", controllers.ChangePasswordUser) // change password as current user
		}
	}
	return router
}
