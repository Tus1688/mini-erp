package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GenerateToken(context *gin.Context) {
	var request models.UserLogin
	var user models.User

	if err := context.ShouldBindJSON(&request); err != nil {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	record := database.Instance.Where("username = ?", request.Username).First(&user)
	if record.Error != nil {
		context.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	credentialError := user.CheckPassword(request.Password)
	if credentialError != nil {
		context.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	tokenString, err := auth.GenerateJWT(user.Username, user.InventoryUser, user.FinanceUser, user.InventoryAdmin, user.FinanceAdmin, user.SystemAdmin)
	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"token": tokenString})
}
