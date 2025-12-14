package utils

import (
	"math"
)

// CalculateDistance calculates the distance between two coordinates in kilometers using the Haversine formula
func CalculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371 // Earth's radius in kilometers

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}

// CalculateFare calculates the estimated fare based on distance
func CalculateFare(distance float64) float64 {
	const baseFare = 50.0
	const perKmRate = 20.0

	return baseFare + (distance * perKmRate)
}

// CalculateEstimatedDuration calculates estimated duration in minutes
func CalculateEstimatedDuration(distance float64) int {
	const avgSpeedKmh = 40.0
	hours := distance / avgSpeedKmh
	return int(math.Ceil(hours * 60))
}
