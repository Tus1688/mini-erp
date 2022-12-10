package main

import (
	"go-api/auth"
	"go-api/cache"
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

	database.RedisConnect()
	cache.CountAllRows()

	router := initRouter()
	router.Run(":6000")
}

func loadEnv() {
	// check if GIN_MODE is release
	if os.Getenv("GIN_MODE") != "release" {
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}
	auth.JwtKey = []byte(os.Getenv("JWT_KEY"))
	log.Print(".env loaded")
}

func initRouter() *gin.Engine {
	router := gin.Default()
	router.Use(middlewares.SetHeader())
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middlewares.ValidateCsrf())
	router.Use(middlewares.EnforceCsrf())
	router.Use(middlewares.TokenExpired(5))

	api := router.Group("/api/v1")
	{
		cust := api.Group("/")
		cust.Use(middlewares.UserIsFinanceUser())
		{
			cust.GET("/customer-count", controllers.GetCustomerCount)
			cust.GET("/customer", controllers.GetCustomer)
			cust.POST("/customer", controllers.CreateCustomer)
			cust.DELETE("/customer", controllers.DeleteCustomer)
			cust.PATCH("/customer", controllers.UpdateCustomer)
		}

		// so finance user can access available stocks
		api.GET("/inventory/stock", controllers.GetStock)                         // get stock by batch and variant
		api.GET("/inventory/monthly-sold-stock", controllers.GetMonthlySoldStock) // get monthly sold stock

		api.GET("/metrics/weekly-production-sales", controllers.GetWeeklyProductionAndSales) // production vs sales
		api.GET("/metrics/best-employee-sales-invoice", controllers.GetBestEmployeeSalesInvoice)

		inv := api.Group("/inventory")
		inv.Use(middlewares.UserIsInventoryUser())
		{
			inv.GET("/batch-count", controllers.GetBatchCount)
			inv.GET("/batch", controllers.GetBatch)
			inv.POST("/batch", controllers.CreateBatch)

			inv.GET("/variant-count", controllers.GetVariantCount)
			inv.GET("/variant", controllers.GetVariant)
			inv.POST("/variant", controllers.CreateVariant)

			// draft table
			inv.GET("/production-count", controllers.GetProductionDraftCount)
			inv.GET("/production", controllers.GetProductionDraft)     // get item transaction log draft
			inv.POST("/production", controllers.CreateProductionDraft) // add stock to draft table

			// low stock
			inv.GET("/low-stock", controllers.GetLowStock)

			admin := inv.Group("/") // admin only (inv_a is true)
			admin.Use(middlewares.UserIsInventoryAdmin())
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
		fin.Use(middlewares.UserIsFinanceUser())
		{
			fin.GET("/term-of-payment-count", controllers.GetTOPCount)
			fin.GET("/term-of-payment", controllers.GetTOP)
			fin.POST("/term-of-payment", controllers.CreateTOP)

			fin.GET("/sales-invoice-draft-count", controllers.GetSalesInvoiceDraftCount)
			fin.GET("/sales-invoice-draft", controllers.GetSalesInvoiceDraft)
			fin.POST("/sales-invoice-draft", controllers.CreateSalesInvoiceDraft)

			fin.GET("/sales-invoice", controllers.GetSalesInvoice)
			fin.GET("/sales-invoice-count", controllers.GetSalesInvoiceCount)

			fin.GET("/weekly-revenue", controllers.GetWeeklyRevenue)
			fin.GET("/best-customer", controllers.GetBestCustomerSalesInvoice)

			admin := fin.Group("/") // admin only (fin_a is true)
			admin.Use(middlewares.UserIsFinanceAdmin())
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
