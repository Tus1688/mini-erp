package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CreateCustomer(c *gin.Context) {
	var customer models.Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	record := database.Instance.Create(&customer)
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "Duplicate entry") {
			c.JSON(http.StatusConflict, gin.H{"error": customer.Name + " already exists"})
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "something went wrong when creating user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Customer created successfully"})
}
