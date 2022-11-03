package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// Imo, delete item should be done in a soft delete manner, so that we can still track the history of the item
// CreateItem is happening in produce controller as it is a part of the produce process

func GetItem(c *gin.Context) {
	var response models.APIInventoryItemResponse
	var responseArr []models.APIInventoryItemResponse
	var requestID models.APICommonQueryId
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBind(&requestID); err == nil {
		database.Instance.Table("items").
			Select("items.id, items.batch_refer, variants.name, batches.expired_date").
			Joins("left join batches on batches.id = items.batch_refer").
			Joins("left join variants on variants.id = items.variant_refer").
			Where("items.id = ?", requestID.ID).Scan(&response)

		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}

		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBind(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("items").
			Select("items.id, items.batch_refer, variants.name, batches.expired_date").
			Joins("left join batches on batches.id = items.batch_refer").
			Joins("left join variants on variants.id = items.variant_refer").
			Where("variants.name LIKE ?", query).
			Limit(10). // need to reconsider this as we might have more than 10 items
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	if err := c.ShouldBind(&requestPaging); err == nil {
		var anchor int
		if requestPaging.Page != 0 {
			anchor = requestPaging.LastID
		} else {
			anchor = (requestPaging.Page * requestPaging.PageSize) - requestPaging.PageSize
		}

		database.Instance.Table("items").
			Select("items.id, items.batch_refer, variants.name, batches.expired_date").
			Joins("left join batches on batches.id = items.batch_refer").
			Joins("left join variants on variants.id = items.variant_refer").
			Where("items.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	c.Status(http.StatusBadRequest)
}

func UpdateItem(c *gin.Context) {
	var request models.APIInventoryItemUpdate
	if err := c.ShouldBind(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	var check models.Item
	database.Instance.Model(&models.Item{}).Where("id = ?", request.ID).First(&check)
	if check.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	if check.BatchRefer == request.BatchRefer && check.VariantRefer == request.VariantRefer {
		c.JSON(http.StatusOK, gin.H{"message": "No changes detected"})
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(&models.Item{
		BatchRefer:   request.BatchRefer,
		VariantRefer: request.VariantRefer,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item updated successfully"})
}

func DeleteItem(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBind(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// !!! WIP !!!
	// check whether there is any item id associated with sales invoices, if yes, then tell user to delete the sales invoice first

	// delete item
	record := database.Instance.Where("id = ?", request.ID).Delete(&models.Item{})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete item because it is being used in inventory / sales invoices"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting item"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}
