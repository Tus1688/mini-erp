package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateBatch(c *gin.Context) {
	var request models.APIInventoryBatchCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Batch{
		CreatedAt:   request.CreatedAt,
		ExpiredDate: request.ExpiredDate,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong when creating batch"})
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Batch created successfully"})
}
