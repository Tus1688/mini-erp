package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

/*
Frontend implementation
choose from batch list or create new batch
choose variant from variant list or create new variant
choose quantity
*/

func CreateProduction(c *gin.Context) {
	var request models.APIInventoryItemProductionCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	transactionRecord := database.Instance.Create(&models.ItemTransactionLog{
		BatchRefer:   request.BatchRefer,
		VariantRefer: request.VariantRefer,
		Quantity:     request.Quantity,
	})
	if transactionRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating stock logs"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "successfully inserted item and stock logs"})
}
