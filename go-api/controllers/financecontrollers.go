package controllers

import (
	"go-api/auth"
	"go-api/database"
	"go-api/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type helperSelectStock struct {
	Name     string // variant name
	ID       int    // batch id
	Quantity int
}

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

		// why we don't include item_transaction_log_drafts? bcs we don't acknowledge awaiting approval production stock
		database.Instance.Raw(`
			select v.name, batch_refer as ID, sum(quantity) as quantity
			from
			(
				select batch_refer, variant_refer, quantity
				from item_transaction_logs
				Union all
				select batch_refer, variant_refer, quantity
				from finance_item_transaction_log_drafts
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

	// declare invoiceDraft so we can use invoiceDraft.ID later
	invoiceDraft := models.InvoiceDraft{
		TOPRefer:      request.TOPRefer,
		CustomerRefer: request.CustomerRefer,
		Date:          request.Date,
		CreatedBy:     username,
	}

	invRecord := database.Instance.Create(&invoiceDraft)
	if invRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (1/3)"})
		return
	}

	// insert item to finance_transaction_log_drafts so stock can be reserved
	var itemDraft []models.FinanceItemTransactionLogDraft
	for _, item := range request.Items {
		itemDraft = append(itemDraft, models.FinanceItemTransactionLogDraft{
			InvoiceDraftRefer: invoiceDraft.ID,
			BatchRefer:        item.BatchRefer,
			VariantRefer:      item.VariantRefer,
			Quantity:          -item.Quantity,
		})
	}
	itemTransactionLogDraft := database.Instance.Create(&itemDraft)
	if itemTransactionLogDraft.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating item transaction log draft (2/3)"})
		// delete invoiceDraft if itemTransactionLogDraft failed
		database.Instance.Delete(&models.InvoiceDraft{}, invoiceDraft.ID)
		return
	}

	// invoiceItems is request.Items combined with Invoice.ID
	var invoiceItems []models.InvoiceItemDraft
	for _, item := range request.Items {
		invoiceItems = append(invoiceItems, models.InvoiceItemDraft{
			InvoiceDraftRefer: invoiceDraft.ID,
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
		// delete invoiceDraft and itemTransactionLogDraft if invItemRecord failed
		database.Instance.Delete(&models.InvoiceDraft{}, invoiceDraft.ID)
		database.Instance.Where("invoice_draft_refer = ?", invoiceDraft.ID).Delete(&models.FinanceItemTransactionLogDraft{})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "successfully created invoice"})
}

func DeleteSalesInvoiceDraft(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// delete from finance_item_transaction_log_drafts
	fin_record := database.Instance.Where("invoice_draft_refer = ?", request.ID).Delete(&models.FinanceItemTransactionLogDraft{})
	if fin_record.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "invoice draft not found"})
		return
	}
	if fin_record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting finance item transaction log draft (1/3)"})
		return
	}

	// delete from invoice_item_drafts
	inv_item_record := database.Instance.Where("invoice_draft_refer = ?", request.ID).Delete(&models.InvoiceItemDraft{})
	if inv_item_record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting invoice item draft (2/3)"})
		return
	}

	// delete from invoice_drafts
	inv_record := database.Instance.Delete(&models.InvoiceDraft{}, request.ID)
	if inv_record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when deleting invoice draft (3/3)"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "successfully deleted invoice"})
}

func ApproveSalesInvoiceDraft(c *gin.Context) {
	var request models.APICommonQueryId
	if err := c.ShouldBindQuery(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// get invoiceDraft from database
	var invoiceDraft models.InvoiceDraft
	database.Instance.First(&invoiceDraft, request.ID)
	if invoiceDraft.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "invoice draft not found"})
		return
	}

	// get invoiceItem from database
	var invoiceItemDrafts []models.InvoiceItemDraft
	database.Instance.Where("invoice_draft_refer = ?", request.ID).Find(&invoiceItemDrafts)

	// get those transaction log draft from database
	var itemTransactionLogDraft []models.FinanceItemTransactionLogDraft
	database.Instance.Where("invoice_draft_refer = ?", request.ID).Find(&itemTransactionLogDraft)

	// create invoice from invoiceDraft
	newInvoice := models.Invoice{
		TOPRefer:      invoiceDraft.TOPRefer,
		CustomerRefer: invoiceDraft.CustomerRefer,
		Date:          invoiceDraft.Date,
		CreatedBy:     invoiceDraft.CreatedBy,
	}
	invRecord := database.Instance.Create(&newInvoice)
	if invRecord.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (1/3)"})
		return
	}

	// from invoiceItemDrafts, create invoiceItems
	var invoiceItems []models.InvoiceItem
	for _, item := range invoiceItemDrafts {
		invoiceItems = append(invoiceItems, models.InvoiceItem{
			InvoiceRefer: newInvoice.ID,
			BatchRefer:   item.BatchRefer,
			VariantRefer: item.VariantRefer,
			Quantity:     item.Quantity,
			Price:        item.Price,
			Discount:     item.Discount,
			Total:        item.Total,
		})
	}
	invItems := database.Instance.Create(&invoiceItems)
	if invItems.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (2/3)"})
		// delete invoice if invItems failed
		database.Instance.Delete(&models.Invoice{}, newInvoice.ID)
		return
	}

	// from itemTransactionLogDraft, create itemTransactionLog
	var itemTransactionLog []models.ItemTransactionLog
	for _, item := range itemTransactionLogDraft {
		itemTransactionLog = append(itemTransactionLog, models.ItemTransactionLog{
			BatchRefer:   item.BatchRefer,
			VariantRefer: item.VariantRefer,
			Quantity:     item.Quantity, // item quantity is already negative so we don't need to change it
		})
	}
	itemTransLog := database.Instance.Create(&itemTransactionLog)
	if itemTransLog.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong when creating invoice (3/3)"})
		// delete invoice and invoiceItems if itemTransLog failed
		database.Instance.Delete(&models.Invoice{}, newInvoice.ID)
		database.Instance.Where("invoice_refer = ?", newInvoice.ID).Delete(&models.InvoiceItem{})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "successfully created invoice"})

	// after inserting all data, then we need to delete those draft data
	// delete from finance_item_transaction_log_drafts
	database.Instance.Where("invoice_draft_refer = ?", request.ID).Delete(&models.FinanceItemTransactionLogDraft{})
	// delete from invoice_item_drafts
	database.Instance.Where("invoice_draft_refer = ?", request.ID).Delete(&models.InvoiceItemDraft{})
	// delete from invoice_drafts
	database.Instance.Delete(&models.InvoiceDraft{}, request.ID)
}

func GetSalesInvoiceDraft(c *gin.Context) {
	var requestID models.APICommonQueryId
	var requestSearch models.APICommonSearch
	var requestPaging models.APICommonPagination

	if err := c.ShouldBindQuery(&requestID); err == nil {
		var invoiceDraft models.APIFinanceInvoiceResponse
		var invoiceItemDraft []models.ItemsResponse
		// query from models.InvoiceDraft where id = requestID.ID
		database.Instance.Raw(`
			select id.id, top.name as "TOPName", c.name as "CustName", id.date, id.created_by, sum(iid.total) as total
			from invoice_drafts id, customers c, term_of_payments top, invoice_item_drafts iid
			where id.customer_refer = c.id and id.top_refer = top.id and iid.invoice_draft_refer = id.id
			and id.id = ?
			group by 1;
		`, requestID.ID).Scan(&invoiceDraft)
		if invoiceDraft.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice draft not found"})
			return
		}

		database.Instance.Raw(`
			select v.name, iid.batch_refer, v.description, iid.price, iid.discount, iid.quantity, iid.total
			from invoice_item_drafts iid
			left join variants v
			on iid.variant_refer = v.id
			where iid.invoice_draft_refer = ?;
		`, requestID.ID).Scan(&invoiceItemDraft)

		c.JSON(http.StatusOK, models.APIFinanceInvoiceResponseSpecific{
			ID:        invoiceDraft.ID,
			TOPName:   invoiceDraft.TOPName,
			CustName:  invoiceDraft.CustName,
			Date:      invoiceDraft.Date,
			CreatedBy: invoiceDraft.CreatedBy,
			Total:     invoiceDraft.Total,
			Items:     invoiceItemDraft,
		})
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		var invoiceDrafts []models.APIFinanceInvoiceResponse

		database.Instance.Raw(`
		select id.id, top.name as "TOPName", c.name as "CustName", id.date, id.created_by, sum(iid.total) as total
		from invoice_drafts id, customers c, term_of_payments top, invoice_item_drafts iid
		where id.customer_refer = c.id and id.top_refer = top.id and iid.invoice_draft_refer = id.id
		and c.name like ?
		group by 1;
		`, "%"+strings.ToLower(requestSearch.Search)+"%").Scan(&invoiceDrafts)

		if invoiceDrafts == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice draft not found"})
			return
		}

		c.JSON(http.StatusOK, invoiceDrafts)
		return
	}

	if err := c.ShouldBindQuery(&requestPaging); err == nil {
		var anchor int
		if requestPaging.LastID != 0 {
			anchor = requestPaging.LastID
		} else {
			anchor = (requestPaging.Page * requestPaging.PageSize) - requestPaging.PageSize
		}
		var invoiceDrafts []models.APIFinanceInvoiceResponse

		database.Instance.Raw(`
		select id.id, top.name as "TOPName", c.name as "CustName", id.date, id.created_by, sum(iid.total) as total
		from invoice_drafts id, customers c, term_of_payments top, invoice_item_drafts iid
		where id.customer_refer = c.id and id.top_refer = top.id and iid.invoice_draft_refer = id.id
		and id.id > ?
		group by 1
		limit ?;
		`, anchor, requestPaging.PageSize).Scan(&invoiceDrafts)

		if invoiceDrafts == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice draft not found"})
			return
		}

		c.JSON(http.StatusOK, invoiceDrafts)
		return
	}
	c.Status(http.StatusBadRequest)
}

func GetSalesInvoice(c *gin.Context) {
	var requestID models.APICommonQueryId
	var requestSearch models.APICommonSearch
	var requestPaging models.APICommonPagination

	if err := c.ShouldBindQuery(&requestID); err == nil {
		var invoice models.APIFinanceInvoiceResponse
		var invoiceItems []models.ItemsResponse
		// query from models.InvoiceDraft where id = requestID.ID
		database.Instance.Raw(`
			select id.id, top.name as "TOPName", c.name as "CustName", id.date, id.created_by, sum(iid.total) as total
			from invoices id, customers c, term_of_payments top, invoice_items iid
			where id.customer_refer = c.id and id.top_refer = top.id and iid.invoice_refer = id.id
			and id.id = ?
			group by 1;
		`, requestID.ID).Scan(&invoice)
		if invoice.ID == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return
		}

		database.Instance.Raw(`
			select v.name, iid.batch_refer, v.description, iid.price, iid.discount, iid.quantity, iid.total
			from invoice_items iid
			left join variants v
			on iid.variant_refer = v.id
			where iid.invoice_refer = ?;
		`, requestID.ID).Scan(&invoiceItems)

		c.JSON(http.StatusOK, models.APIFinanceInvoiceResponseSpecific{
			ID:        invoice.ID,
			TOPName:   invoice.TOPName,
			CustName:  invoice.CustName,
			Date:      invoice.Date,
			CreatedBy: invoice.CreatedBy,
			Total:     invoice.Total,
			Items:     invoiceItems,
		})
		return
	}

	if err := c.ShouldBindQuery(&requestSearch); err == nil {
		var invoices []models.APIFinanceInvoiceResponse

		database.Instance.Raw(`
		select id.id, top.name as "TOPName", c.name as "CustName", id.date, id.created_by, sum(iid.total) as total
		from invoices id, customers c, term_of_payments top, invoice_items iid
		where id.customer_refer = c.id and id.top_refer = top.id and iid.invoice_refer = id.id
		and c.name like ?
		group by 1;
		`, "%"+strings.ToLower(requestSearch.Search)+"%").Scan(&invoices)

		if invoices == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return
		}

		c.JSON(http.StatusOK, invoices)
		return
	}

	if err := c.ShouldBindQuery(&requestPaging); err == nil {
		var anchor int
		if requestPaging.LastID != 0 {
			anchor = requestPaging.LastID
		} else {
			anchor = (requestPaging.Page * requestPaging.PageSize) - requestPaging.PageSize
		}
		var invoices []models.APIFinanceInvoiceResponse

		database.Instance.Raw(`
		select id.id, top.name as "TOPName", c.name as "CustName", id.date, id.created_by, sum(iid.total) as total
		from invoices id, customers c, term_of_payments top, invoice_items iid
		where id.customer_refer = c.id and id.top_refer = top.id and iid.invoice_refer = id.id
		and id.id > ?
		group by 1
		limit ?;
		`, anchor, requestPaging.PageSize).Scan(&invoices)

		if invoices == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "invoice not found"})
			return
		}

		c.JSON(http.StatusOK, invoices)
		return
	}
	c.Status(http.StatusBadRequest)
}
