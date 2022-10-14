package middlewares

import (
	"go-auth/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Auth(expiredIn int8) gin.HandlerFunc {
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
