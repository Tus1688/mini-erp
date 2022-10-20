package controllers

import (
	"fmt"
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *gin.Context) {
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

	// make a JTI for the token, and store it as key in redis with value of 32 random bytes
	jti := auth.GenerateRandomString(10)
	refresh_token := auth.GenerateRandomString(32)

	redisKey := fmt.Sprintf("%s %s", user.Username, jti)
	redisError := database.Rdb.Set(database.Rdb.Context(), redisKey, refresh_token, 0).Err()
	if redisError != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token 1"})
		return
	}

	tokenString, err := auth.GenerateJWT(
		user.Username,
		user.InventoryUser,
		user.FinanceUser,
		user.InventoryAdmin,
		user.SystemAdmin,
		csrf_token,
		jti)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token 2"})
		return
	}
	c.SetCookie("refresh_token", refresh_token, 60*60*12, "/", os.Getenv("DOMAIN_NAME"), false, true)
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

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

func ChangePasswordUser(c *gin.Context) {
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
