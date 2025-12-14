module github.com/namycodes/yanga-services/services/auth-service

go 1.21

replace github.com/namycodes/yanga-services/shared-lib => ../../shared-lib

require (
	github.com/gorilla/mux v1.8.1
	github.com/namycodes/yanga-services/shared-lib v0.0.0
	github.com/swaggo/http-swagger v1.3.4
)
