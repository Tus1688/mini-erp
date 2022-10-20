package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RefreshToken(c *gin.Context) {
	refresh_cookie, err := c.Cookie("refresh_token")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Refresh token not found"})
		return
	}
	signedToken := c.GetHeader("Authorization")
	claims, err := auth.ExtractClaims(signedToken)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	username := claims.Username
	jti := claims.ID

	redisKey := username + " " + jti

	redisValue, redisError := database.Rdb.Get(database.Rdb.Context(), redisKey).Result()
	if redisError != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid sessions!"})
		return
	}
	if redisValue != refresh_cookie {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid sessions!"})
		return
	}

	csrf_token, csrfError := c.Cookie("csrf_token")
	if csrfError != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "CSRF token not found"})
		return
	}

	newToken, generateError := auth.GenerateJWT(
		claims.Username,
		claims.Inv_u,
		claims.Fin_u,
		claims.Inv_a,
		claims.Sys_a,
		csrf_token,
		claims.ID)
	if generateError != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error while generating token 2"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"Token": newToken})
}
