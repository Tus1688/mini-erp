package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

/***************************
RETRIEVE
***************************/

func GetCity(c *gin.Context) {
	var response []models.APICityResponse

	database.Instance.Table("cities c").Select("c.id, c.city_name, p.province_name, ct.country_name").
		Joins("left join provinces p on c.province_refer = p.id").
		Joins("left join countries ct on ct.id = p.country_refer").Scan(&response)

	if response == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No city found"})
		return
	}
	c.JSON(http.StatusOK, response)
}

func GetProvince(c *gin.Context) {
	var response []models.APIProvinceResponse

	database.Instance.Table("provinces p").Select("p.id, p.province_name, ct.country_name").
		Joins("left join countries ct on ct.id = p.country_refer").Scan(&response)

	if response == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No province found"})
		return
	}
	c.JSON(http.StatusOK, response)
}

func GetCountry(c *gin.Context) {
	var response []models.APICountryResponse

	database.Instance.Table("countries").Select("id, country_name").Order("id asc").Scan(&response)

	if response == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No country found"})
		return
	}
	c.JSON(http.StatusOK, response)
}

/***************************
CREATE
***************************/

func CreateCity(c *gin.Context) {
	var request models.APICityCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.City{
		CityName:      strings.ToLower(request.CityName),
		ProvinceRefer: request.ProvinceID,
	})
	if record.Error != nil {
		// 1062 is the error code for duplicate entry
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.CityName + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating city"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "City created successfully"})
}

func CreateProvince(c *gin.Context) {
	var request models.APIProvinceCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Province{
		ProvinceName: strings.ToLower(request.ProvinceName),
		CountryRefer: request.CountryID,
	})
	if record.Error != nil {
		// 1062 is the error code for duplicate entry
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.ProvinceName + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating province"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Province created successfully"})
}

func CreateCountry(c *gin.Context) {
	var request models.APICountryCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Create(&models.Country{
		CountryName: strings.ToLower(request.CountryName),
	})
	if record.Error != nil {
		// 1062 is the error code for duplicate entry
		if strings.Contains(record.Error.Error(), "1062") {
			c.JSON(http.StatusConflict, gin.H{"error": request.CountryName + " already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating country"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Country created successfully"})
}

/***************************
DELETE
***************************/

func DeleteCity(c *gin.Context) {
	var request models.ApiGeoDelete
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.City{})
	if record.Error != nil {
		// 1451 is the error code for foreign key constraint
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete city because it is being used in some address"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting city"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "City not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "City deleted successfully"})
}

func DeleteProvince(c *gin.Context) {
	var request models.ApiGeoDelete
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.Province{})
	if record.Error != nil {
		// 1451 is the error code for foreign key constraint
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete province because it is being used by a city"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting province"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Province not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Province deleted successfully"})
}

func DeleteCountry(c *gin.Context) {
	var request models.ApiGeoDelete
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Delete(&models.Country{})
	if record.Error != nil {
		// 1451 is the error code for foreign key constraint
		if strings.Contains(record.Error.Error(), "1451") {
			c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete country because it is being used by a province"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting country"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Country not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Country deleted successfully"})
}

/***************************
UPDATE
***************************/

func UpdateCity(c *gin.Context) {
	var request models.APICityUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(models.City{
		CityName:      strings.ToLower(request.CityName),
		ProvinceRefer: request.ProvinceID,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating city"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "City not found or no changes were made"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "City updated successfully"})
}

func UpdateProvince(c *gin.Context) {
	var request models.APIProvinceUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(models.Province{
		ProvinceName: strings.ToLower(request.ProvinceName),
		CountryRefer: request.CountryID,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating province"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Province not found or no changes were made"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Province updated successfully"})
}

func UpdateCountry(c *gin.Context) {
	var request models.APICountryUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	record := database.Instance.Where("id = ?", request.ID).Updates(models.Country{
		CountryName: strings.ToLower(request.CountryName),
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when updating country"})
		return
	}
	if record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Country not found or no changes were made"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Country updated successfully"})
}
