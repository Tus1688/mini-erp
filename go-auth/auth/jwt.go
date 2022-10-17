package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var JwtKey []byte

type JWTClaim struct {
	Username   string // username
	Inv_u      *bool  // inventory user
	Fin_u      *bool  // finance user
	Inv_a      *bool  // inventory admin
	Fin_a      *bool  // finance admin
	Sys_a      *bool  // system admin
	Csrf_token string // provided csrf_token cookie value
	jwt.RegisteredClaims
}

func GenerateJWT(
	username string,
	inv_u *bool,
	fin_u *bool,
	inv_a *bool,
	fin_a *bool,
	sys_a *bool,
	csrf_token string) (tokenString string, err error) {
	encryptedCsrf := Encrypt(JwtKey, csrf_token)
	claims := &JWTClaim{
		Username:   username,
		Inv_u:      inv_u,
		Fin_u:      fin_u,
		Inv_a:      inv_a,
		Fin_a:      fin_a,
		Sys_a:      sys_a,
		Csrf_token: encryptedCsrf,
		RegisteredClaims: jwt.RegisteredClaims{
			// iat give more flexibility in defining the expiration time
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(JwtKey)
	return
}

func ValidateTokenExpired(signedToken string, minute_to_exp int8) (err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		},
	)
	if err != nil {
		return
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		err = errors.New("invalid token")
	}
	// check whether the token is expired in @minute_to_exp
	if claims.IssuedAt.Time.Add(time.Duration(minute_to_exp) * time.Minute).Before(time.Now()) {
		err = errors.New("token expired")
		return
	}
	return
}

func ValidateCsrfToken(signedToken string, csrf_token string) (err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		},
	)
	if err != nil {
		return
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		err = errors.New("invalid token")
	}
	decryptedCsrf := Decrypt(JwtKey, claims.Csrf_token)
	if decryptedCsrf != csrf_token {
		err = errors.New("invalid csrf token")
	}
	return
}

func GetUsernameFromToken(signedToken string) (username string, err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&JWTClaim{},
		func(token *jwt.Token) (interface{}, error) {
			return JwtKey, nil
		},
	)
	if err != nil {
		return
	}
	claims, ok := token.Claims.(*JWTClaim)
	if !ok {
		err = errors.New("invalid token")
	}
	username = claims.Username
	return
}

func Encrypt(key []byte, text string) string {
	// key := []byte(keyText)
	plaintext := []byte(text)

	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err)
	}

	// The IV needs to be unique, but not secure. Therefore it's common to
	// include it at the beginning of the ciphertext.
	ciphertext := make([]byte, aes.BlockSize+len(plaintext))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		panic(err)
	}

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintext)

	// convert to base64
	return base64.URLEncoding.EncodeToString(ciphertext)
}

// Decrypt from base64 to decrypted string
func Decrypt(key []byte, cryptoText string) string {
	ciphertext, _ := base64.URLEncoding.DecodeString(cryptoText)

	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err)
	}

	// The IV needs to be unique, but not secure. Therefore it's common to
	// include it at the beginning of the ciphertext.
	if len(ciphertext) < aes.BlockSize {
		panic("ciphertext too short")
	}
	iv := ciphertext[:aes.BlockSize]
	ciphertext = ciphertext[aes.BlockSize:]

	stream := cipher.NewCFBDecrypter(block, iv)

	// XORKeyStream can work in-place if the two arguments are the same.
	stream.XORKeyStream(ciphertext, ciphertext)

	// return fmt.Sprintf("%s", ciphertext)
	return string(ciphertext)
}
