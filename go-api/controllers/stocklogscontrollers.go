package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetItemTransactionLogCount(c *gin.Context) {
	var count int64
	database.Instance.Table("item_transaction_logs").Count(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func GetItemTransactionLogs(c *gin.Context) {
	var response models.APIInventoryTransactionLogResponse
	var responseArr []models.APIInventoryTransactionLogResponse
	var requestID models.APICommonQueryId
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBindQuery(&requestID); err == nil {
		database.Instance.Table("item_transaction_logs itr").
			Select("itr.id, itr.batch_refer, variants.name, itr.quantity, itr.created_at").
			Joins("LEFT JOIN variants ON variants.id = itr.variant_refer").
			Where("itr.id = ?", requestID.ID).
			Scan(&response)

		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log not found"})
			return
		}
		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("item_transaction_logs itr").
			Select("itr.id, itr.batch_refer, variants.name, itr.quantity, itr.created_at").
			Joins("LEFT JOIN variants ON variants.id = itr.variant_refer").
			Where("variants.name LIKE ?", query).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log not found"})
			return
		}
		c.JSON(http.StatusOK, responseArr)
		return
	}

	if err := c.ShouldBindQuery(&requestPaging); err == nil {
		var anchor int
		if requestPaging.LastID != 0 {
			anchor = requestPaging.LastID
		} else {
			anchor = (requestPaging.Page * requestPaging.PageSize) - requestPaging.PageSize
		}

		database.Instance.Table("item_transaction_logs itr").
			Select("itr.id, itr.batch_refer, variants.name, itr.quantity, itr.created_at").
			Joins("LEFT JOIN variants ON variants.id = itr.variant_refer").
			Where("itr.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log not found"})
			return
		}
		c.JSON(http.StatusOK, responseArr)
		return
	}

	c.Status(http.StatusBadRequest)
}
