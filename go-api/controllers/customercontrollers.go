package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetCustomer(c *gin.Context) {
	var response models.APICustomerResponseSpecific
	var responseArr []models.APICustomerResponse
	var request models.APICommonQueryId

	if err := c.ShouldBind(&request); err != nil {
		database.Instance.Table("customers").
			Select("customers.id, customers.name, customers.tax_id, customers.address").
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No customer found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	// select c.id, c.name, c.tax_id, c.address, ct.city_name, p.province_name, ctr.country_name from customers c left join cities ct on c.city_refer = ct.id left join provinces p on ct.province_refer = p.id left join countries ctr on p.country_refer = ctr.id;
	database.Instance.Table("customers").
		Select("customers.id, customers.name, customers.tax_id, customers.address, cities.city_name, provinces.province_name, countries.country_name").
		Joins("left join cities on customers.city_refer = cities.id").
		Joins("left join provinces on cities.province_refer = provinces.id").
		Joins("left join countries on provinces.country_refer = countries.id").
		Having("customers.id = ?", request.ID).Scan(&response)

	if response.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No customer found"})
		return
	}

	c.JSON(http.StatusOK, response)
}

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

func UpdateCustomer(c *gin.Context) {
	var request models.APICustomerUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(models.Customer{
		Name:      strings.ToLower(request.Name),
		TaxID:     strings.ToLower(request.TaxID),
		Address:   strings.ToLower(request.Address),
		CityRefer: request.City,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating customer"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found or no changes were made"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer updated successfully"})
}

func DeleteCustomer(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBind(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.Customer{})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete customer because it is being used in some order/invoice"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting customer"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}
