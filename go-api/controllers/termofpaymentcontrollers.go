package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetTOPCount(c *gin.Context) {
	redisValue, redisErr := database.Rdb.Get(database.Rdb.Context(), "term_of_payment_count").Result()
	if redisErr != nil {
		var count int64
		database.Instance.Model(&models.TermOfPayment{}).Count(&count)
		c.JSON(http.StatusOK, gin.H{"count": count})
		database.Rdb.Set(database.Rdb.Context(), "term_of_payment_count", count, 0)
		return
	}
	redisValueInt, _ := strconv.Atoi(redisValue)
	c.JSON(http.StatusOK, gin.H{"count": redisValueInt})
}

func GetTOP(c *gin.Context) {
	var response models.APIFinanceTOP
	var responseArr []models.APIFinanceTOP
	var requestID models.APICommonQueryId
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBindQuery(&requestID); err == nil {
		database.Instance.Model(&models.TermOfPayment{}).Where("id = ?", requestID.ID).
			First(&response)
		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "TOP not found, somebody might have deleted it"})
			return
		}
		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		database.Instance.Model(&models.TermOfPayment{}).
			Where("name LIKE ?", "%"+strings.ToLower(requestSearch.Search)+"%").
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No TOP found"})
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

		database.Instance.Model(&models.TermOfPayment{}).
			Where("id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No TOP found"})
			return
		}
		c.JSON(http.StatusOK, responseArr)
		return
	}

	c.Status(http.StatusBadRequest)
}

func CreateTOP(c *gin.Context) {
	var request models.APIFinanceTOPCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	record := database.Instance.Create(&models.TermOfPayment{
		Name:    strings.ToLower(request.Name),
		DueDate: request.DueDate,
	})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.Name + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating TOP"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "TOP created"})
	database.Rdb.Incr(database.Rdb.Context(), "term_of_payment_count")
}

func UpdateTOP(c *gin.Context) {
	var request models.APIFinanceTOP
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	var check models.TermOfPayment
	database.Instance.Model(&models.TermOfPayment{}).Where("id = ?", request.ID).First(&check)
	if check.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "TOP not found, somebody might have deleted it"})
		return
	}
	if request.Name == check.Name && request.DueDate == check.DueDate {
		c.JSON(http.StatusOK, gin.H{"message": "No changed detected"})
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(&models.TermOfPayment{
		Name:    strings.ToLower(request.Name),
		DueDate: request.DueDate,
	})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.Name + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating TOP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "TOP updated successfully"})
}

func DeleteTOP(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.TermOfPayment{})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete TOP because it is being used in transaction"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting TOP"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "TOP not found, somebody might have deleted it"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "TOP deleted successfully"})
	database.Rdb.Decr(database.Rdb.Context(), "term_of_payment_count")
}
