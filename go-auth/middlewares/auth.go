package middlewares

import (
	"go-auth/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @expiredIn = int / minutes
func TokenExpired(expiredIn int8) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
			return
		}
		err := auth.ValidateTokenExpired(tokenString, expiredIn)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.Next()
	}
}

func EnforceCsrf() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
			return
		}
		cookie, _ := c.Cookie("csrf_token")
		if cookie == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "CSRF token not found"})
			return
		}
		err := auth.ValidateCsrfToken(tokenString, cookie)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
	}
}

func SetCSP() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Next()
	}
}
