package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func CreateItem(c *gin.Context) {
	var request models.APIInventoryItemCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	data := models.Item{BatchRefer: request.BatchRefer, VariantRefer: request.VariantRefer}
	record := database.Instance.Create(&data)
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating item"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Item with id " + strconv.Itoa(data.ID) + " created successfully"})
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
