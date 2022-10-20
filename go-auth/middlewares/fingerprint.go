package middlewares

import (
	"go-auth/auth"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// Assign CSRF cookie to client if not exist
func AssignCsrf() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := c.Cookie("csrf_token")
		if err != nil {
			csrfToken := auth.GenerateRandomString(32)
			encryptedCsrf := auth.Encrypt(auth.JwtKey, csrfToken)
			c.SetSameSite(http.SameSiteStrictMode)
			c.SetCookie("csrf_token", csrfToken, 60*60*12, "/", os.Getenv("DOMAIN_NAME"), false, true)
			c.SetCookie("validate", encryptedCsrf, 60*60*12, "/", os.Getenv("DOMAIN_NAME"), false, true)
			c.Next()
		}
		c.Next()
	}
}

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
