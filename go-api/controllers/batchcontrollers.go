package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetBatchCount(c *gin.Context) {
	var count int64
	database.Instance.Table("batches").Count(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func GetBatch(c *gin.Context) {
	var response models.APIInventoryBatchResponse
	var responseArr []models.APIInventoryBatchResponse
	var requestID models.APICommonQueryId
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBindQuery(&requestID); err == nil {
		database.Instance.Table("batches b").
			Select("b.id, b.created_at, b.expired_date").
			Where("b.id = ?", requestID.ID).Scan(&response)

		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Batch not found, somebody might have deleted it"})
			return
		}
		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		database.Instance.Table("batches b").
			Select("b.id, b.created_at, b.expired_date").
			Where("b.expired_date LIKE ?", "%"+requestSearch.Search+"%").
			Limit(10).
			Scan(&responseArr)

		if len(responseArr) == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Batch not found"})
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

		database.Instance.Table("batches b").
			Select("b.id, b.created_at, b.expired_date").
			Where("b.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Batch not found"})
			return
		}
		c.JSON(http.StatusOK, responseArr)
		return
	}
}

func CreateBatch(c *gin.Context) {
	var request models.APIInventoryBatchCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Batch{
		ExpiredDate: request.ExpiredDate,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong when creating batch"})
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Batch created successfully"})
}

func DeleteBatch(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.Batch{})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete batch because it is used by Item"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong when deleting batch"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Batch not found, somebody might have deleted it"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Batch deleted successfully"})
}

func UpdateBatch(c *gin.Context) {
	var request models.APIInventoryBatchUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// validate whether request.ID is exists and check if there is update
	var check models.Batch
	database.Instance.Model(&models.Batch{}).Where("id = ?", request.ID).First(&check)
	if check.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Batch not found, somebody might have deleted it"})
		return
	}
	if check.ExpiredDate == request.ExpiredDate {
		c.JSON(http.StatusOK, gin.H{"message": "No changes detected"})
		return
	}

	record := database.Instance.Model(&models.Batch{}).Where("id = ?", request.ID).Updates(models.Batch{
		ExpiredDate: request.ExpiredDate,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong when updating batch"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Batch updated successfully"})
}
