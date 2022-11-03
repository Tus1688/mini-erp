package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetStock(c *gin.Context) {
	var responseArr []models.APIInventoryStockReponse
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBind(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("item_transaction_logs").
			Select("variants.name, batches.id, batches.expired_date, SUM(item_transaction_logs.quantity) as quantity").
			Joins("LEFT JOIN variants ON variants.id = item_transaction_logs.variant_refer").
			Joins("LEFT JOIN batches ON batches.id = item_transaction_logs.batch_refer").
			Group("item_transaction_logs.variant_refer, item_transaction_logs.batch_refer").
			Where("variants.name LIKE ?", query).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No stock found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	if err := c.ShouldBind(&requestPaging); err == nil {
		var anchor int
		if requestPaging.LastID != 0 {
			anchor = requestPaging.LastID
		} else {
			anchor = (requestPaging.Page * requestPaging.PageSize) - requestPaging.PageSize
		}

		database.Instance.Table("item_transaction_logs").
			Select("variants.name, batches.id, batches.expired_date, SUM(item_transaction_logs.quantity) as quantity").
			Joins("LEFT JOIN variants ON variants.id = item_transaction_logs.variant_refer").
			Joins("LEFT JOIN batches ON batches.id = item_transaction_logs.batch_refer").
			Group("item_transaction_logs.variant_refer, item_transaction_logs.batch_refer").
			Where("item_transaction_logs.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}
	c.Status(http.StatusBadRequest)
}
