package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func AdminChangePassword(c *gin.Context) {
	var request models.AdminChangePassword
	var user models.User

	if err := c.ShouldBindJSON(&request); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), 10)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while hashing password"})
		return
	}

	if database.Instance.Model(&user).Where("username = ?", request.Username).Update("password", string(hashedPassword)).RowsAffected == 0 {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
	auth.PurgeSessionMatchPattern(request.Username)
}

func AdminToggleActive(c *gin.Context) {
	var request models.AdminToggleActiveStatus
	var user models.User
	if err := c.ShouldBindJSON(&request); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	query := database.Instance.Where("username = ?", request.Username).First(&user)
	if query.Error != nil {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if database.Instance.Model(&user).Where("username = ?", request.Username).Update("active", request.Active).RowsAffected == 0 {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "User is already in the requested state"})
		return
	}

	if pointerTobool(request.Active) {
		c.JSON(http.StatusOK, gin.H{"message": "User activated successfully"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "User deactivated successfully"})
	}
}

func pointerTobool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}
