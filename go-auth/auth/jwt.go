package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var JwtKey []byte

type JWTClaim struct {
	Username   string // username
	Inv_u      *bool  // inventory user
	Fin_u      *bool  // finance user
	Inv_a      *bool  // inventory admin
	Sys_a      *bool  // system admin
	Csrf_token string // provided csrf_token cookie value
	jwt.RegisteredClaims
}

func GenerateJWT(
	username string,
	inv_u *bool,
	fin_u *bool,
	inv_a *bool,
	sys_a *bool,
	csrf_token string,
	id string) (tokenString string, err error) {
	encryptedCsrf := Encrypt(JwtKey, csrf_token)
	claims := &JWTClaim{
		Username:   username,
		Inv_u:      inv_u,
		Fin_u:      fin_u,
		Inv_a:      inv_a,
		Sys_a:      sys_a,
		Csrf_token: encryptedCsrf,
		RegisteredClaims: jwt.RegisteredClaims{
			// iat give more flexibility in defining the expiration time
			IssuedAt: jwt.NewNumericDate(time.Now()),
			ID:       id,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err = token.SignedString(JwtKey)
	return
}

func ValidateTokenExpired(signedToken string, minute_to_exp int8) (err error) {
	claims, err := ExtractClaims(signedToken)
	// check whether the token is expired in @minute_to_exp
	if claims.IssuedAt.Time.Add(time.Duration(minute_to_exp) * time.Minute).Before(time.Now()) {
		err = errors.New("token expired")
		return
	}
	return
}

func ValidateCsrfToken(signedToken string, csrf_token string) (err error) {
	claims, err := ExtractClaims(signedToken)
	decryptedCsrf := Decrypt(JwtKey, claims.Csrf_token)
	if decryptedCsrf != csrf_token {
		err = errors.New("invalid csrf token")
	}
	return
}

func GetUsernameFromToken(signedToken string) (username string, err error) {
	claims, err := ExtractClaims(signedToken)
	if err != nil {
		return
	}
	username = claims.Username
	return
}

func GetJTIFromToken(signedToken string) (jti string, err error) {
	claims, err := ExtractClaims(signedToken)
	if err != nil {
		return
	}
	jti = claims.ID
	return
}

func TokenIsFinanceUser(signedToken string) (err error) {
	claims, err := ExtractClaims(signedToken)
	if err != nil {
		return
	}
	isFinanceUser := *claims.Fin_u
	if !isFinanceUser {
		err = errors.New("not finance user")
	}
	return
}

func TokenIsInventoryUser(signedToken string) (err error) {
	claims, err := ExtractClaims(signedToken)
	if err != nil {
		return
	}
	isInventoryUser := *claims.Inv_u
	if !isInventoryUser {
		err = errors.New("not inventory user")
	}
	return
}

func TokenIsInventoryAdmin(signedToken string) (err error) {
	claims, err := ExtractClaims(signedToken)
	if err != nil {
		return
	}
	isInventoryAdmin := *claims.Inv_a
	if !isInventoryAdmin {
		err = errors.New("not inventory admin")
	}
	return
}

func TokenIsSystemAdmin(signedToken string) (err error) {
	claims, err := ExtractClaims(signedToken)
	if err != nil {
		return
	}
	isSystemAdmin := *claims.Sys_a
	if !isSystemAdmin {
		err = errors.New("not system admin")
	}
	return
}

func ExtractClaims(signedToken string) (claims *JWTClaim, err error) {
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
	return
}
