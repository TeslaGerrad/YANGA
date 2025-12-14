-- Drop triggers
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
DROP TRIGGER IF EXISTS update_driver_profiles_updated_at ON driver_profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_ride_requests_status;
DROP INDEX IF EXISTS idx_ride_requests_trip_id;
DROP INDEX IF EXISTS idx_ride_requests_driver_id;
DROP INDEX IF EXISTS idx_ratings_rated_id;
DROP INDEX IF EXISTS idx_ratings_trip_id;
DROP INDEX IF EXISTS idx_trips_created_at;
DROP INDEX IF EXISTS idx_trips_status;
DROP INDEX IF EXISTS idx_trips_driver_id;
DROP INDEX IF EXISTS idx_trips_user_id;
DROP INDEX IF EXISTS idx_driver_profiles_is_online;
DROP INDEX IF EXISTS idx_driver_profiles_user_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_phone;

-- Drop tables
DROP TABLE IF EXISTS ride_requests;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS driver_profiles;
DROP TABLE IF EXISTS users;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";
