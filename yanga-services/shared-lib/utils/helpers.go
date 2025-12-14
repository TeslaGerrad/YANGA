package utils

import (
	"fmt"

	"github.com/google/uuid"
)

// ParseUUID parses a string into a UUID
func ParseUUID(s string) (uuid.UUID, error) {
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("invalid UUID format: %w", err)
	}
	return id, nil
}

// GenerateUUID generates a new UUID
func GenerateUUID() uuid.UUID {
	return uuid.New()
}
