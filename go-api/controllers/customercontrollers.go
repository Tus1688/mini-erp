package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetCustomerCount(c *gin.Context) {
	var count int64
	database.Instance.Table("customers").Count(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func GetCustomer(c *gin.Context) {
	var response models.APICustomerResponseSpecific
	var responseArr []models.APICustomerResponse
	var requestID models.APICommonQueryId
	var requestPaging models.APICommonPagination
	var requestSearch models.APICommonSearch

	if err := c.ShouldBindQuery(&requestID); err == nil {
		// select c.id, c.name, c.tax_id, c.address, ct.city_name, p.province_name, ctr.country_name from customers c left join cities ct on c.city_refer = ct.id left join provinces p on ct.province_refer = p.id left join countries ctr on p.country_refer = ctr.id;
		database.Instance.Table("customers").
			Select("id, name, tax_id, address, city_name, province_name, country_name").
			Where("customers.id = ?", requestID.ID).Scan(&response)

		if response.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "No customer found"})
			return
		}

		c.JSON(http.StatusOK, response)
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Table("customers").
			Select("customers.id, customers.name, customers.tax_id, customers.address").
			Where("customers.name LIKE ?", query).
			Limit(10).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No customer found"})
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

		database.Instance.Table("customers").
			Select("customers.id, customers.name, customers.tax_id, customers.address").
			Where("customers.id > ?", anchor).
			Limit(requestPaging.PageSize).
			Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No customer found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}

	c.Status(http.StatusBadRequest)
}

func CreateCustomer(c *gin.Context) {
	var request models.APICustomerCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Customer{
		Name:         strings.ToLower(request.Name),
		TaxID:        strings.ToLower(request.TaxID),
		Address:      strings.ToLower(request.Address),
		CityName:     strings.ToLower(request.CityName),
		ProvinceName: strings.ToLower(request.ProvinceName),
		CountryName:  strings.ToLower(request.CountryName),
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

	var check models.Customer
	database.Instance.Model(&models.Customer{}).Where("id = ?", request.ID).First(&check)
	if check.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}
	if check.Name == strings.ToLower(request.Name) && check.TaxID == request.TaxID &&
		check.Address == strings.ToLower(request.Address) && check.CityName == strings.ToLower(request.CityName) &&
		check.ProvinceName == strings.ToLower(request.ProvinceName) && check.CountryName == strings.ToLower(request.CountryName) {
		c.JSON(http.StatusOK, gin.H{"message": "No changes detected"})
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(models.Customer{
		Name:         strings.ToLower(request.Name),
		TaxID:        strings.ToLower(request.TaxID),
		Address:      strings.ToLower(request.Address),
		CityName:     strings.ToLower(request.CityName),
		ProvinceName: strings.ToLower(request.ProvinceName),
		CountryName:  strings.ToLower(request.CountryName),
	})
	if record.Error != nil {
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.Name + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating customer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer updated successfully"})
}

func DeleteCustomer(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
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
