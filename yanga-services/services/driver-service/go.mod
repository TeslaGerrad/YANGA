module github.com/namycodes/yanga-services/services/driver-service

go 1.23.0

replace github.com/namycodes/yanga-services/shared-lib => ../../shared-lib

require (
	github.com/gorilla/mux v1.8.1
	github.com/jackc/pgx/v5 v5.7.6
	github.com/namycodes/yanga-services/shared-lib v0.0.0
	github.com/swaggo/http-swagger v1.3.4
)
