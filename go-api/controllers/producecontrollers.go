package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

/*
Frontend implementation
choose from batch list or create new batch
choose variant from variant list or create new variant
choose quantity
*/

func GetProductionDraftCount(c *gin.Context) {
	redisValue, redisErr := database.Rdb.Get(database.Rdb.Context(), "production_draft_count").Result()
	if redisErr != nil {
		var count int64
		database.Instance.Model(&models.ItemTransactionLogDraft{}).Count(&count)
		c.JSON(http.StatusOK, gin.H{"count": count})
		database.Rdb.Set(database.Rdb.Context(), "production_draft_count", count, 0)
		return
	}
	redisValueInt, _ := strconv.Atoi(redisValue)
	c.JSON(http.StatusOK, gin.H{"count": redisValueInt})
}

func CreateProductionDraft(c *gin.Context) {
	var request models.APIInventoryItemProductionCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	if request.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be greater than 0"})
		return
	}

	transactionRecord := database.Instance.Create(&models.ItemTransactionLogDraft{
		BatchRefer:   request.BatchRefer,
		VariantRefer: request.VariantRefer,
		Quantity:     request.Quantity,
	})
	if transactionRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating stock logs"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "successfully inserted item and stock logs to Draft"})
	database.Rdb.Incr(database.Rdb.Context(), "production_draft_count")
}

func GetProductionDraft(c *gin.Context) {
	var response models.APIInventoryTransactionLogResponse
	var responseArr []models.APIInventoryTransactionLogResponse
	var requestID models.APICommonQueryId
	var requestSearch models.APICommonSearch
	var requestPaging models.APICommonPagination

	if err := c.ShouldBindQuery(&requestID); err == nil {
		database.Instance.Table("item_transaction_log_drafts itr").
			Select("itr.id, itr.batch_refer, variants.name, itr.quantity, itr.created_at").
			Joins("LEFT JOIN variants ON variants.id = itr.variant_refer").
			Where("itr.id = ?", requestID.ID).
			Scan(&response)

		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log draft not found"})
			return
		}
		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("item_transaction_log_drafts itr").
			Select("itr.id, itr.batch_refer, variants.name, itr.quantity, itr.created_at").
			Joins("LEFT JOIN variants ON variants.id = itr.variant_refer").
			Where("variants.name LIKE ?", query).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log draft not found"})
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

		database.Instance.Table("item_transaction_log_drafts itr").
			Select("itr.id, itr.batch_refer, variants.name, itr.quantity, itr.created_at").
			Joins("LEFT JOIN variants ON variants.id = itr.variant_refer").
			Order("itr.id ASC").
			Where("itr.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log draft not found"})
			return
		}
		c.JSON(http.StatusOK, responseArr)
		return
	}
	c.Status(http.StatusBadRequest)
}

func UpdateProductionDraft(c *gin.Context) {
	var request models.APIInventoryItemProductionUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	var check models.ItemTransactionLogDraft
	database.Instance.Model(&models.ItemTransactionLogDraft{}).Where("id = ?", request.ID).First(&check)
	if check.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log draft not found"})
		return
	}
	if check.BatchRefer == request.BatchRefer && check.VariantRefer == request.VariantRefer && check.Quantity == request.Quantity {
		c.JSON(http.StatusOK, gin.H{"error": "No changes detected"})
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(&models.ItemTransactionLogDraft{
		BatchRefer:   request.BatchRefer,
		VariantRefer: request.VariantRefer,
		Quantity:     request.Quantity,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating stock logs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "successfully updated item and stock logs to Draft"})
}

func DeleteProductionDraft(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.ItemTransactionLogDraft{})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting stock logs"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log draft not found, somebody might have approved/deleted it"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "successfully deleted item and stock logs in draft"})
	database.Rdb.Decr(database.Rdb.Context(), "production_draft_count")
}

func ApproveProductionDraft(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	// get draft value
	var draft models.ItemTransactionLogDraft
	database.Instance.Model(&models.ItemTransactionLogDraft{}).Where("id = ?", request.ID).First(&draft)
	if draft.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction log draft not found, somebody might have approved/deleted it"})
		return
	}
	// delete those draft value
	database.Instance.Where("id = ?", request.ID).Delete(&models.ItemTransactionLogDraft{})
	// move to "real" table
	record := models.ItemTransactionLog{BatchRefer: draft.BatchRefer, VariantRefer: draft.VariantRefer, Quantity: draft.Quantity}
	query := database.Instance.Create(&record)
	if query.Error != nil {
		database.Instance.Create(&draft)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when approving stock logs, rollbacking changes..."})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "successfully approved item and stock logs"})
	// only decr production draft count as we don't track inventory row
	database.Rdb.Decr(database.Rdb.Context(), "production_draft_count")
}
