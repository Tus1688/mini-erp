package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CreateCustomer(c *gin.Context) {
	var request models.APICustomerCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Customer{
		Name:      strings.ToLower(request.Name),
		TaxID:     strings.ToLower(request.TaxID),
		Address:   strings.ToLower(request.Address),
		CityRefer: request.City,
	})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.Name + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating customer"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Customer created successfully"})
}
