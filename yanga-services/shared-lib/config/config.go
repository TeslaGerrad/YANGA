package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	ServiceHost    string
	ServicePort    string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	JWTSecret      string
	JWTExpiryHours int
	NatsURL        string
	TwilioSID      string
	TwilioToken    string
	TwilioPhone    string
	Service        ServiceConfig
}

type ServiceConfig struct {
	Host string
	Port string
}

type JWTConfig struct {
	Secret string
}

func Load() *Config {
	return &Config{
		ServiceHost:    getEnv("SERVICE_HOST", "0.0.0.0"),
		ServicePort:    getEnv("SERVICE_PORT", "8080"),
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", "postgres"),
		DBName:         getEnv("DB_NAME", "yanga_db"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiryHours: getEnvAsInt("JWT_EXPIRY_HOURS", 24),
		NatsURL:        getEnv("NATS_URL", "nats://localhost:4222"),
		TwilioSID:      getEnv("TWILIO_ACCOUNT_SID", ""),
		TwilioToken:    getEnv("TWILIO_AUTH_TOKEN", ""),
		TwilioPhone:    getEnv("TWILIO_PHONE_NUMBER", ""),
	}
}

func LoadConfig() *Config {
	cfg := Load()
	cfg.Service = ServiceConfig{
		Host: cfg.ServiceHost,
		Port: cfg.ServicePort,
	}
	return cfg
}

func (c *Config) DatabaseURL() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost,
		c.DBPort,
		c.DBUser,
		c.DBPassword,
		c.DBName,
		c.DBSSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
