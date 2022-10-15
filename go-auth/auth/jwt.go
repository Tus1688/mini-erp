package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
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
	encryptedCsrf, _ := Encrypt(JwtKey, []byte(csrf_token))
	claims := &JWTClaim{
		Username:   username,
		Inv_u:      inv_u,
		Fin_u:      fin_u,
		Inv_a:      inv_a,
		Fin_a:      fin_a,
		Sys_a:      sys_a,
		Csrf_token: fmt.Sprintf("%0x", encryptedCsrf),
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
	decryptedCsrf, err1 := Decrypt(JwtKey, []byte(claims.Csrf_token))
	if err1 != nil {
		err = errors.New("here")
	}
	if string(decryptedCsrf) != csrf_token {
		err = errors.New("invalid csrf token")
	}
	return
}

func Encrypt(key, text []byte) ([]byte, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	b := base64.StdEncoding.EncodeToString(text)
	ciphertext := make([]byte, aes.BlockSize+len(b))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return nil, err
	}
	cfb := cipher.NewCFBEncrypter(block, iv)
	cfb.XORKeyStream(ciphertext[aes.BlockSize:], []byte(b))
	// log.Printf("%0x", ciphertext)
	// decrypted, _ := Decrypt(key, ciphertext)
	// log.Printf("%s", decrypted)
	// log.Print("type of ciphertext: ", fmt.Sprintf("%T", ciphertext))
	return ciphertext, nil
}

func Decrypt(key, text []byte) ([]byte, error) {
	log.Printf("key from decrypt: %0x", key)
	log.Printf("txt from decrypt: %0x", text)
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	if len(text) < aes.BlockSize {
		return nil, errors.New("ciphertext too short")
	}
	iv := text[:aes.BlockSize]
	text = text[aes.BlockSize:]
	cfb := cipher.NewCFBDecrypter(block, iv)
	cfb.XORKeyStream(text, text)
	data, err := base64.StdEncoding.DecodeString(string(text))
	if err != nil {
		return nil, err
	}
	// log.Printf("%s", data)
	return data, nil
}
