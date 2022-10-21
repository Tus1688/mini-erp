package auth

import "go-auth/database"

func PurgeSessionMatchPattern(username string) {
	keys := database.Rdb.Keys(database.Rdb.Context(), username+" *").Val()
	database.Rdb.Del(database.Rdb.Context(), keys...)
}
