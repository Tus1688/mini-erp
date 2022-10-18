package middlewares

import (
	"go-auth/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UserIsSysAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		token_string := c.GetHeader("Authorization")
		if token_string == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "no token provided"})
			return
		}
		err := auth.TokenIsSystemAdmin(token_string)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.Next()
	}
}
