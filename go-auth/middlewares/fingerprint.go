package middlewares

import (
	"crypto/sha256"
	"math/rand"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func AssignCsrf() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := c.Cookie("csrf_token")
		if err != nil {
			csrfToken := generateRandomString(32)
			c.SetSameSite(http.SameSiteStrictMode)
			c.SetCookie("csrf_token", csrfToken, 60*60*12, "/", os.Getenv("DOMAIN_NAME"), false, true)
			c.Next()
		}
		c.Next()
	}
}

func AssignUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, err := c.Cookie("usr")
		if err != nil {
			c.SetSameSite(http.SameSiteStrictMode)
			ip := c.ClientIP()
			user_agent := c.Request.UserAgent()
			c.SetCookie("usr", generateUserHash(ip, user_agent, generateRandomString(5)), 60*60*12, "/", os.Getenv("DOMAIN_NAME"), false, true)
			c.Next()
		}
	}
}

func generateRandomString(n int) string {
	ascii := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = ascii[rand.Intn(len(ascii))]
	}
	return string(b)
}

func generateUserHash(ip string, user_agent string, salt string) string {
	sha := sha256.New()
	sha.Write([]byte(ip + user_agent + salt))
	return string(sha.Sum(nil))
}
