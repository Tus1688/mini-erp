package controllers

import (
	"go-api/database"
	"go-api/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

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
	var responseArr []models.APIInventoryLowStockResponse
	database.Instance.Raw(`
		select v.name, variant_refer as VariantID, sum(quantity) as quantity
		from 
		(
			select variant_refer, quantity
			from item_transaction_logs
			Union all
			select variant_refer, quantity
			from finance_item_transaction_log_drafts
		) t
		left join variants v on v.id = t.variant_refer 
		group by t.variant_refer
		having sum(quantity) > 0 and sum(quantity) < 100;
	`).Scan(&responseArr)

	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Low stock not found"})
		return
	}
	c.JSON(http.StatusOK, responseArr)
}

func GetMonthlySoldStock(c *gin.Context) {
	var responseArr []models.APIInventoryMonthlyStockSoldResponse
	database.Instance.Raw(`
		select v.name, sum(i.quantity) * -1 as quantity 
		from item_transaction_logs i, variants v
		where created_at >=  DATE_SUB(now(), INTERVAL 30 DAY) AND created_at <= now()
		and i.variant_refer = v.id and i.quantity < 0
		group by variant_refer
		order by sum(i.quantity) * -1 desc
		limit 5;
	`).Scan(&responseArr)

	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Monthly sold stock not found"})
		return
	}
	c.JSON(http.StatusOK, responseArr)
}
