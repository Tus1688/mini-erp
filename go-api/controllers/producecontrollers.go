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
	// create the item in the database and retrieve the ID
	item := models.Item{BatchRefer: request.BatchRefer, VariantRefer: request.VariantRefer}
	itemRecord := database.Instance.Create(&item)
	if itemRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating item (1/2)"})
		return
	}

	// insert the itemID to ItemTransactionLog
	transaction := models.ItemTransactionLog{ItemRefer: item.ID, Quantity: request.Quantity}
	transactionRecord := database.Instance.Create(&transaction)
	if transactionRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating stock logs (2/2)"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "successfully inserted item and stock logs"})
}
