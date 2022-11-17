package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetStockCount(c *gin.Context) {
	var count int64
	database.Instance.Raw("select count(*) as count from ( select sum(quantity) from item_transaction_logs group by variant_refer, batch_refer ) d1;").
		Scan(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func GetStock(c *gin.Context) {
	var responseArr []models.APIInventoryStockReponse
	var requestSearch models.APICommonSearch

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("item_transaction_logs").
			Select("variants.name, batches.id, batches.expired_date, SUM(item_transaction_logs.quantity) as quantity").
			Joins("LEFT JOIN variants ON variants.id = item_transaction_logs.variant_refer").
			Joins("LEFT JOIN batches ON batches.id = item_transaction_logs.batch_refer").
			Where("variants.name LIKE ?", query).
			Group("item_transaction_logs.variant_refer, item_transaction_logs.batch_refer").
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No stock found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	database.Instance.Table("item_transaction_logs").
		Select("variants.name, batches.id, batches.expired_date, SUM(item_transaction_logs.quantity) as quantity").
		Joins("LEFT JOIN variants ON variants.id = item_transaction_logs.variant_refer").
		Joins("LEFT JOIN batches ON batches.id = item_transaction_logs.batch_refer").
		Group("item_transaction_logs.variant_refer, item_transaction_logs.batch_refer").
		Scan(&responseArr)

	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}

	c.JSON(http.StatusOK, responseArr)
}
