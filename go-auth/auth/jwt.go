package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var JwtKey []byte = []byte(os.Getenv("JWT_KEY"))

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
	claims := &JWTClaim{
		Username:   username,
		Inv_u:      inv_u,
		Fin_u:      fin_u,
		Inv_a:      inv_a,
		Fin_a:      fin_a,
		Sys_a:      sys_a,
		Csrf_token: csrf_token,
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
