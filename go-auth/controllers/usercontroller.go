package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	if err := user.HashPassword(user.Password); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while creating user"})
		return
	}
	record := database.Instance.Create(&user)
	if record.Error != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
}

func ChangePassword(c *gin.Context) {
	var request models.UserForgotPassword
	var user models.User
	if err := c.ShouldBindJSON(&request); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if request.Password == request.NewPassword {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "New password cannot be the same as old password"})
		return
	}

	// get username from JWT
	token := c.Request.Header.Get("Authorization")
	username, err := auth.GetUsernameFromToken(token)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	// verify current password
	database.Instance.Where("username = ?", username).First(&user)
	credentialError := user.CheckPassword(request.Password)
	if credentialError != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	// update password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), 10)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while creating user"})
		return
	}
	update := database.Instance.Model(&models.User{}).Where("username = ?", username).Update("password", string(hashedPassword))
	if update.Error != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while updating password"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
