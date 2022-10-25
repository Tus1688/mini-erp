package middlewares

import (
	"go-api/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ValidateCsrf() gin.HandlerFunc {
	return func(c *gin.Context) {
		validate, err := c.Cookie("validate")
		if err != nil {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		csrf, err := c.Cookie("csrf_token")
		if err != nil {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		decryptedCsrf := auth.Decrypt(auth.JwtKey, validate)
		if decryptedCsrf != csrf {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}
		c.Next()
	}
}
