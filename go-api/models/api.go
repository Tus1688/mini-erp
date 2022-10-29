package models

type APICommonQueryId struct {
	ID int `form:"id" binding:"required"`
}

type APICommonPagination struct {
	Page     int `form:"page" binding:"required"`
	PageSize int `form:"page_size" binding:"required"`
}
