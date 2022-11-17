package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetVariantCount(c *gin.Context) {
	var count int64
	database.Instance.Table("variants").Count(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func GetVariant(c *gin.Context) {
	var response models.APIInventoryVariantResponse
	var responseArr []models.APIInventoryVariantResponse
	var requestID models.APICommonQueryId
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBindQuery(&requestID); err == nil {
		database.Instance.Table("variants").
			Select("variants.id, variants.name, variants.description").
			Where("variants.id = ?", requestID.ID).Scan(&response)

		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "No variant found"})
			return
		}

		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("variants").
			Select("variants.id, variants.name, variants.description").
			Where("variants.name LIKE ?", query).
			Limit(10).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No variant found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	if err := c.ShouldBindQuery(&requestPaging); err == nil {
		var anchor int
		if requestPaging.Page != 0 {
			anchor = requestPaging.LastID
		} else {
			anchor = (requestPaging.Page * requestPaging.PageSize) - requestPaging.PageSize
		}

		database.Instance.Table("variants").
			Select("variants.id, variants.name, variants.description").
			Where("variants.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No variant found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	c.Status(http.StatusBadRequest)
}

func CreateVariant(c *gin.Context) {
	var request models.APIInventoryVariantCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Variant{
		Name:        strings.ToLower(request.Name),
		Description: strings.ToLower(request.Description),
	})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.Name + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating variant"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Variant created successfully"})
}

func UpdateVariant(c *gin.Context) {
	var request models.APIInventoryVariantUpdate
	if err := c.ShouldBind(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	var check models.Variant
	database.Instance.Model(&models.Variant{}).Where("id = ?", request.ID).First(&check)
	if check.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Variant not found"})
		return
	}
	if check.Name == strings.ToLower(request.Name) && check.Description == strings.ToLower(request.Description) {
		c.JSON(http.StatusOK, gin.H{"message": "No changes detected"})
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(&models.Variant{
		Name:        strings.ToLower(request.Name),
		Description: strings.ToLower(request.Description),
	})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.Name + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating variant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Variant updated successfully"})
}

func DeleteVariant(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.Variant{})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete variant because it is being used in item"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting variant"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Variant not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Variant deleted successfully"})
}
