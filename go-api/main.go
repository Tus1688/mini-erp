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
		api.GET("/customer-count", controllers.GetCustomerCount)
		api.GET("/customer", controllers.GetCustomer)
		api.POST("/customer", controllers.CreateCustomer)
		api.DELETE("/customer", controllers.DeleteCustomer)
		api.PATCH("/customer", controllers.UpdateCustomer)

		inv := api.Group("/inventory")
		{
			inv.GET("/batch-count", controllers.GetBatchCount)
			inv.GET("/batch", controllers.GetBatch)
			inv.POST("/batch", controllers.CreateBatch)

			inv.GET("/variant-count", controllers.GetVariantCount)
			inv.GET("/variant", controllers.GetVariant)
			inv.POST("/variant", controllers.CreateVariant)

			// real table
			inv.GET("/item-transaction-log-count", controllers.GetItemTransactionLogCount)
			inv.GET("/item-transaction-log", controllers.GetItemTransactionLogs) // transaction logs whether it's production or sales
			inv.GET("/stock-count", controllers.GetStockCount)
			inv.GET("/stock", controllers.GetStock) // get stock by batch and variant

			// draft table
			inv.GET("/production-count", controllers.GetProductionDraftCount)
			inv.GET("/production", controllers.GetProductionDraft)     // get item transaction log draft
			inv.POST("/production", controllers.CreateProductionDraft) // add stock to draft table

			admin := inv.Group("/") // admin only (inv_a is true)
			// admin.Use(middlewares.UserIsInventoryAdmin())
			{
				admin.DELETE("/batch", controllers.DeleteBatch)
				admin.PATCH("/batch", controllers.UpdateBatch)

				admin.DELETE("/variant", controllers.DeleteVariant)
				admin.PATCH("/variant", controllers.UpdateVariant)

				admin.PATCH("/production", controllers.UpdateProductionDraft)  // update item transaction log draft
				admin.DELETE("/production", controllers.DeleteProductionDraft) // delete item transaction log draft
				admin.PUT("/production", controllers.ApproveProductionDraft)   // approve draft and move it to "real" table
			}
		}

		fin := api.Group("/finance")
		{
			fin.GET("/term-of-payment-count", controllers.GetTOPCount)
			fin.GET("/term-of-payment", controllers.GetTOP)
			fin.POST("/term-of-payment", controllers.CreateTOP)

			fin.GET("/sales-invoice-draft-count", controllers.GetSalesInvoiceDraftCount)
			fin.GET("/sales-invoice-draft", controllers.GetSalesInvoiceDraft)
			fin.POST("/sales-invoice-draft", controllers.CreateSalesInvoiceDraft)

			fin.GET("/sales-invoice", controllers.GetSalesInvoice)

			admin := fin.Group("/") // admin only (fin_a is true)
			// admin.User(middlewares.UserIsFinanceAdmin())
			{
				admin.PATCH("/term-of-payment", controllers.UpdateTOP)
				admin.DELETE("/term-of-payment", controllers.DeleteTOP)

				admin.DELETE("/sales-invoice-draft", controllers.DeleteSalesInvoiceDraft)
				admin.PUT("/sales-invoice-draft", controllers.ApproveSalesInvoiceDraft)
			}
		}
	}

	return router
}
