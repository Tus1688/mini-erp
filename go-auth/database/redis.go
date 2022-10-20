package database

import (
	"log"
	"os"

	"github.com/go-redis/redis/v8"
)

var Rdb *redis.Client

func RedisConnect() {
	Rdb = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST") + ":" + os.Getenv("REDIS_PORT"),
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,
	})
	if err := Rdb.Ping(Rdb.Context()).Err(); err != nil {
		log.Fatal(err)
	}
	log.Print("Connected to Redis!")
}
