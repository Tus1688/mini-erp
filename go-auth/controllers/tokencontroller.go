package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GenerateToken(c *gin.Context) {
	var request models.UserLogin
	var user models.User

	if err := c.ShouldBindJSON(&request); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	csrf_token, _ := c.Cookie("csrf_token")
	if csrf_token == "" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "CSRF token not found"})
		return
	}

	record := database.Instance.Where("username = ? and active = 1", request.Username).First(&user)
	if record.Error != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	credentialError := user.CheckPassword(request.Password)
	if credentialError != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	tokenString, err := auth.GenerateJWT(
		user.Username,
		user.InventoryUser,
		user.FinanceUser,
		user.InventoryAdmin,
		user.SystemAdmin,
		csrf_token)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}
