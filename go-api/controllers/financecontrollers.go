package controllers

import (
	"go-api/auth"
	"go-api/database"
	"go-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateSalesInvoiceDraft(c *gin.Context) {
	var request models.APIFinanceInvoiceCreate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	username, err := auth.GetUsernameFromToken(c.GetHeader("Authorization"))
	if err != nil {
		c.Status(http.StatusUnauthorized)
		return
	}

	// validate stock in ItemTransactionLog group by request.BatchRefer and request.VariantRefer
	// if stock is not enough, return error
	// if stock is enough, create ItemTransactionLog
	for _, item := range request.Items {
		var stock helperSelectStock

		database.Instance.Raw(`
			select v.name, batch_refer as ID, sum(quantity) as quantity
			from
			(
				select batch_refer, variant_refer, quantity
				from item_transaction_logs
				Union all
				select batch_refer, variant_refer, quantity
				from item_transaction_log_drafts
				where quantity < 0
			) t
			left join variants v
			on v.id = t.variant_refer
			group by t.batch_refer, t.variant_refer
			having t.batch_refer = ? and t.variant_refer = ?;
		`, item.BatchRefer, item.VariantRefer).Scan(&stock)

		if stock.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stock / Item not found"})
			return
		}

		if stock.Quantity < item.Quantity {
			// c.JSON(http.StatusConflict, gin.H{"error": "Stock is not enough for " + stock.Name + " batch " + strconv.Itoa(item.BatchRefer)})
			c.JSON(http.StatusConflict, stock)
			return
		}
	}

	// declare invoice so we can use invoice.ID later
	invoice := models.InvoiceDraft{
		TOPRefer:      request.TOPRefer,
		CustomerRefer: request.CustomerRefer,
		Date:          request.Date,
		CreatedBy:     username,
	}

	invRecord := database.Instance.Create(&invoice)
	if invRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (1/2)"})
		return
	}

	// toBeInserted is request.Items combined with Invoice.ID
	var toBeInserted []helperInsert
	for _, item := range request.Items {
		toBeInserted = append(toBeInserted, helperInsert{
			InvoiceDraftRefer: invoice.ID,
			BatchRefer:        item.BatchRefer,
			VariantRefer:      item.VariantRefer,
			Quantity:          item.Quantity,
			Price:             item.Price,
			Discount:          item.Discount,
			Total:             (item.Price * item.Quantity) - ((item.Price * item.Quantity) * item.Discount / 100),
		})
	}

	invItemRecord := database.Instance.Model(&models.InvoiceItemDraft{}).Create(&toBeInserted)
	if invItemRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (2/2)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "successfully created invoice"})
}

type helperInsert struct {
	InvoiceDraftRefer int
	BatchRefer        int
	VariantRefer      int
	Quantity          int
	Price             int
	Discount          int
	Total             int
}

type helperSelectStock struct {
	Name     string // variant name
	ID       int    // batch id
	Quantity int
}
