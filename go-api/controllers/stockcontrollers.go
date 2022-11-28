package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetStockCount(c *gin.Context) {
	var count int64
	database.Instance.Raw("select count(*) as count from ( select sum(quantity) from item_transaction_logs group by variant_refer, batch_refer ) d1;").
		Scan(&count)
	c.JSON(http.StatusOK, gin.H{"count": count})
}

func GetStock(c *gin.Context) {
	var responseArr []models.APIInventoryStockReponse
	var requestSearch models.APICommonSearch

	// search query is optional and will be used to select and items on sales invoice draft
	// so the quantity should be greater than 0
	// union the table with finance_item_transaction_log_drafts as those items are also on awaiting approval sales invoice
	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		query := "%" + strings.ToLower(requestSearch.Search) + "%"
		database.Instance.Raw(`
			select v.name, variant_refer as VariantID, batch_refer as ID, b.expired_date, sum(quantity) as quantity
			from 
			(
				select batch_refer, variant_refer, quantity
				from item_transaction_logs
				Union all
				select batch_refer, variant_refer, quantity
				from finance_item_transaction_log_drafts
			) t
			left join variants v on v.id = t.variant_refer
			left join batches b on b.id = t.batch_refer
			where v.name like ?
			group by t.variant_refer, t.batch_refer
			having sum(quantity) > 0
		`, query).Scan(&responseArr)

		if responseArr == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No stock found"})
			return
		}

		c.JSON(http.StatusOK, responseArr)
		return
	}
	database.Instance.Raw(`
		select v.name, variant_refer as VariantID, batch_refer as ID, b.expired_date, sum(quantity) as quantity
		from 
		(
			select batch_refer, variant_refer, quantity
			from item_transaction_logs
			Union all
			select batch_refer, variant_refer, quantity
			from finance_item_transaction_log_drafts
		) t
		left join variants v on v.id = t.variant_refer
		left join batches b on b.id = t.batch_refer
		group by t.variant_refer, t.batch_refer
		having sum(quantity) > 0
	`).Scan(&responseArr)

	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock not found"})
		return
	}

	c.JSON(http.StatusOK, responseArr)
}

func GetLowStock(c *gin.Context) {
	var responseArr []models.APIInventoryStockReponse
	database.Instance.Raw(`
		select v.name, variant_refer as VariantID, batch_refer as ID, b.expired_date, sum(quantity) as quantity
		from 
		(
			select batch_refer, variant_refer, quantity
			from item_transaction_logs
			Union all
			select batch_refer, variant_refer, quantity
			from finance_item_transaction_log_drafts
		) t
		left join variants v on v.id = t.variant_refer 
		left join batches b on b.id = t.batch_refer 
		group by t.variant_refer, t.batch_refer
		having sum(quantity) > 0 and sum(quantity) < 100;
	`).Scan(&responseArr)

	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Low stock not found"})
		return
	}
	c.JSON(http.StatusOK, responseArr)
}
