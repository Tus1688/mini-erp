package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetBestEmployeeSalesInvoice(c *gin.Context) {
	var responseArr []models.APIMetricBestEmployee
	database.Instance.Raw(`
		select created_by as name, count(*) as total from invoices 
		where date >=  DATE_SUB(now(), INTERVAL 30 DAY) AND date <= now()
		group by created_by
		order by 2 desc
		limit 5;
	`).Scan(&responseArr)

	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No best employee found"})
		return
	}
	c.JSON(http.StatusOK, responseArr)
}
