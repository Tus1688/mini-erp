package controllers

import (
	"go-api/auth"
	"go-api/database"
	"go-api/models"
	"net/http"
	"strconv"

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

		// for item_transaction_log_drafts, we don't acknowledge awaiting approval production stock
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
			c.JSON(http.StatusConflict, gin.H{"error": "Stock is not enough for " + stock.Name +
				" (variant id: " + strconv.Itoa(item.VariantRefer) + " batch id: " + strconv.Itoa(item.BatchRefer) + ")"})
			return
		}
	}

	// insert item to transaction_log_drafts so stock can be reserved
	var itemDraft []models.ItemTransactionLogDraft
	for _, item := range request.Items {
		itemDraft = append(itemDraft, models.ItemTransactionLogDraft{
			BatchRefer:   item.BatchRefer,
			VariantRefer: item.VariantRefer,
			Quantity:     -item.Quantity,
		})
	}
	itemTransactionLogDraft := database.Instance.Create(&itemDraft)
	if itemTransactionLogDraft.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating item transaction log draft (1/3)"})
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (2/3)"})
		return
	}

	// invoiceItems is request.Items combined with Invoice.ID
	var invoiceItems []models.InvoiceItemDraft
	for _, item := range request.Items {
		invoiceItems = append(invoiceItems, models.InvoiceItemDraft{
			InvoiceDraftRefer: invoice.ID,
			BatchRefer:        item.BatchRefer,
			VariantRefer:      item.VariantRefer,
			Quantity:          item.Quantity,
			Price:             item.Price,
			Discount:          item.Discount,
			Total:             (item.Price * item.Quantity) - ((item.Price * item.Quantity) * item.Discount / 100),
		})
	}

	invItemRecord := database.Instance.Create(&invoiceItems)
	if invItemRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (3/3)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "successfully created invoice"})
}

type helperSelectStock struct {
	Name     string // variant name
	ID       int    // batch id
	Quantity int
}
