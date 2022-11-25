package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"
	"os"
	"time"

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

	redisKey := user.Username + " " + jti
	redisError := database.Rdb.Set(database.Rdb.Context(), redisKey, refresh_token, 10*time.Hour).Err()
	if redisError != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token 1"})
		return
	}

	tokenString, err := auth.GenerateJWT(
		user.Username,
		user.InventoryUser,
		user.FinanceUser,
		user.FinanceAdmin,
		user.InventoryAdmin,
		user.SystemAdmin,
		csrf_token,
		jti)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token 2"})
		return
	}
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("refresh_token", refresh_token, 60*60*10, "/", os.Getenv("DOMAIN_NAME"), false, true)
	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"inv_u": user.InventoryUser,
		"fin_u": user.FinanceUser,
		"fin_a": user.FinanceAdmin,
		"inv_a": user.InventoryAdmin,
		"sys_a": user.SystemAdmin,
	})
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
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while creating password"})
		return
	}
	update := database.Instance.Model(&models.User{}).Where("username = ?", username).Update("password", string(hashedPassword))
	if update.Error != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while updating password"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
	auth.PurgeSessionMatchPattern(username)
}

func Logout(c *gin.Context) {
	signedToken := c.GetHeader("Authorization")
	claims, err := auth.ExtractClaims(signedToken)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	// redisKey = Username + " " + JTI
	redisKey := claims.Username + " " + claims.ID
	redisError := database.Rdb.Del(database.Rdb.Context(), redisKey).Err()
	if redisError != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while logging out"})
		return
	}
	// send expired refresh_token, csrf_token, validate cookie to client to revoke prev cookies
	c.SetCookie("refresh_token", "", -1, "/", os.Getenv("DOMAIN_NAME"), false, true)
	c.SetCookie("csrf_token", "", -1, "/", os.Getenv("DOMAIN_NAME"), false, true)
	c.SetCookie("validate", "", -1, "/", os.Getenv("DOMAIN_NAME"), false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
