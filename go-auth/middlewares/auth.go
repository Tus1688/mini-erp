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
		cookie, _ := c.Cookie("csrf_token")
		if cookie == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no csrf_token cookie provided"})
			return
		}
		err1 := auth.ValidateCsrfToken(tokenString, cookie)
		if err1 != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err1.Error()})
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
