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
	log.Print(".env loaded")
}

func initRouter() *gin.Engine {
	router := gin.Default()
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	// router.Use(middlewares.ValidateCsrf())
	// router.Use(middlewares.TokenExpired(60))

	api := router.Group("/api/v1")
	{
		api.GET("/customer", controllers.GetCustomer)
		api.POST("/customer", controllers.CreateCustomer)
		api.DELETE("/customer", controllers.DeleteCustomer)
		api.PATCH("/customer", controllers.UpdateCustomer)

		geo := api.Group("/geo")
		{
			geo.GET("/city", controllers.GetCity)
			geo.GET("/province", controllers.GetProvince)
			geo.GET("/country", controllers.GetCountry)

			geo.POST("/city", controllers.CreateCity)
			geo.POST("/province", controllers.CreateProvince)
			geo.POST("/country", controllers.CreateCountry)

			geo.DELETE("/city", controllers.DeleteCity)
			geo.DELETE("/province", controllers.DeleteProvince)
			geo.DELETE("/country", controllers.DeleteCountry)

			geo.PATCH("/city", controllers.UpdateCity)
			geo.PATCH("/province", controllers.UpdateProvince)
			geo.PATCH("/country", controllers.UpdateCountry)
		}

		inv := api.Group("/inventory")
		{
			inv.GET("/batch", controllers.GetBatch)
			inv.POST("/batch", controllers.CreateBatch)

			inv.GET("/variant", controllers.GetVariant)
			inv.POST("/variant", controllers.CreateVariant)

			// real table
			inv.GET("/item-transaction-log", controllers.GetItemTransactionLogs) // transaction logs whether it's production or sales
			inv.GET("/stock", controllers.GetStock)                              // get stock by batch and variant

			// draft table
			inv.GET("/production", controllers.GetProductionDraft)     // get item transaction log draft
			inv.POST("/production", controllers.CreateProductionDraft) // add stock to draft table

			admin := inv.Group("/") // admin only (inv_a is true)
			// admin.Use(middlewares.UserIsInventoryAdmin())
			{
				admin.DELETE("/batch", controllers.DeleteBatch)
				admin.PATCH("/batch", controllers.UpdateBatch)

				admin.DELETE("/variant", controllers.DeleteVariant)
				admin.PATCH("/variant", controllers.UpdateVariant)
			}
		}
	}

	return router
}
