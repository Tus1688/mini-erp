package models

type APICommonQueryId struct {
	ID int `form:"id" binding:"required"`
}

type APICommonPagination struct {
	Page     int `form:"page" binding:"required"`
	PageSize int `form:"page_size" binding:"required"`
	LastID   int `form:"last_id"`
}

type APICommonSearch struct {
	Search string `form:"search" binding:"required"`
}
