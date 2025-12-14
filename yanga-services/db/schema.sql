--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--
-- Name: update_updated_at_column(); Type: FUNCTION
--
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE
--
CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    phone_number character varying(20) UNIQUE NOT NULL,
    email character varying(255) UNIQUE,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(20) NOT NULL CHECK (role IN ('user', 'driver', 'admin')),
    profile_image_url character varying(500),
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    reset_token character varying(255),
    reset_token_expiry timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: driver_profiles; Type: TABLE
--
CREATE TABLE public.driver_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    license_number character varying(100) UNIQUE NOT NULL,
    vehicle_type character varying(50) NOT NULL,
    vehicle_model character varying(100) NOT NULL,
    vehicle_color character varying(50) NOT NULL,
    vehicle_plate_number character varying(20) UNIQUE NOT NULL,
    is_online boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    rating numeric(3,2) DEFAULT 0.00,
    total_trips integer DEFAULT 0,
    current_latitude numeric(10,8),
    current_longitude numeric(11,8),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: trips; Type: TABLE
--
CREATE TABLE public.trips (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id),
    driver_id uuid REFERENCES public.users(id),
    pickup_latitude numeric(10,8) NOT NULL,
    pickup_longitude numeric(11,8) NOT NULL,
    pickup_address text NOT NULL,
    dropoff_latitude numeric(10,8) NOT NULL,
    dropoff_longitude numeric(11,8) NOT NULL,
    dropoff_address text NOT NULL,
    estimated_fare numeric(10,2),
    actual_fare numeric(10,2),
    estimated_duration integer,
    actual_duration integer,
    distance numeric(10,2),
    status character varying(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    payment_status character varying(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_method character varying(20) CHECK (payment_method IN ('cash', 'card', 'wallet')),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: ratings; Type: TABLE
--
CREATE TABLE public.ratings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    rater_id uuid NOT NULL REFERENCES public.users(id),
    rated_id uuid NOT NULL REFERENCES public.users(id),
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, rater_id)
);

--
-- Name: ride_requests; Type: TABLE
--
CREATE TABLE public.ride_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    driver_id uuid NOT NULL REFERENCES public.users(id),
    status character varying(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at timestamp without time zone NOT NULL,
    responded_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, driver_id)
);

--
-- Name: idx_users_phone; Type: INDEX
--
CREATE INDEX idx_users_phone ON public.users USING btree (phone_number);
CREATE INDEX idx_users_role ON public.users USING btree (role);
CREATE INDEX idx_driver_profiles_user_id ON public.driver_profiles USING btree (user_id);
CREATE INDEX idx_driver_profiles_is_online ON public.driver_profiles USING btree (is_online);
CREATE INDEX idx_trips_user_id ON public.trips USING btree (user_id);
CREATE INDEX idx_trips_driver_id ON public.trips USING btree (driver_id);
CREATE INDEX idx_trips_status ON public.trips USING btree (status);
CREATE INDEX idx_trips_created_at ON public.trips USING btree (created_at);
CREATE INDEX idx_ratings_trip_id ON public.ratings USING btree (trip_id);
CREATE INDEX idx_ratings_rated_id ON public.ratings USING btree (rated_id);
CREATE INDEX idx_ride_requests_driver_id ON public.ride_requests USING btree (driver_id);
CREATE INDEX idx_ride_requests_trip_id ON public.ride_requests USING btree (trip_id);
CREATE INDEX idx_ride_requests_status ON public.ride_requests USING btree (status);

--
-- Name: users update_users_updated_at; Type: TRIGGER
--
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: driver_profiles update_driver_profiles_updated_at; Type: TRIGGER
--
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON public.driver_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- Name: trips update_trips_updated_at; Type: TRIGGER
--
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

--
-- PostgreSQL database dump complete
--
