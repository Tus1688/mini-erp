FROM golang:alpine AS builder

RUN apk update && apk add alpine-sdk git && rm -rf /var/cache/apk/*
RUN mkdir -p api
WORKDIR /api

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY . .
RUN go build -o ./app ./main.go

FROM alpine:latest

RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*
WORKDIR /api
COPY --from=builder /api/app .

# we dont need to copy ENV variable as we use compose file to set it
EXPOSE 6000

ENTRYPOINT [ "./app" ]