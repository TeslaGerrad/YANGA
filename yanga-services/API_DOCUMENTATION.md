# Yanga Rides API Documentation

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Sign Up

**Endpoint:** `POST /auth/signup`

**Description:** Register a new user or driver account.

**Request Body:**
```json
{
  "phone_number": "+254712345678",
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "role": "user"
}
```

**Fields:**
- `phone_number` (string, required): User's phone number with country code
- `email` (string, optional): User's email address
- `password` (string, required): Password (minimum 6 characters)
- `full_name` (string, required): User's full name
- `role` (string, required): Either "user" or "driver"

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_number": "+254712345678",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "is_verified": false,
    "is_active": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
}
```

---

### 2. Sign In

**Endpoint:** `POST /auth/signin`

**Description:** Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "phone_number": "+254712345678",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_number": "+254712345678",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

---

### 3. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request a password reset token.

**Request Body:**
```json
{
  "phone_number": "+254712345678"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset code sent to your phone"
}
```

---

### 4. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using the reset token.

**Request Body:**
```json
{
  "reset_token": "abc123def456...",
  "new_password": "newsecurepassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

---

## Trip Endpoints (User)

### 5. Create Trip

**Endpoint:** `POST /trips`

**Authentication:** Required (User role)

**Description:** Create a new ride request.

**Request Body:**
```json
{
  "pickup_latitude": -1.286389,
  "pickup_longitude": 36.817223,
  "pickup_address": "Nairobi CBD, Kenya",
  "dropoff_latitude": -1.292066,
  "dropoff_longitude": 36.821945,
  "dropoff_address": "Westlands, Nairobi"
}
```

**Response:** `201 Created`
```json
{
  "trip": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "pickup_latitude": -1.286389,
    "pickup_longitude": 36.817223,
    "pickup_address": "Nairobi CBD, Kenya",
    "dropoff_latitude": -1.292066,
    "dropoff_longitude": 36.821945,
    "dropoff_address": "Westlands, Nairobi",
    "estimated_fare": 450.00,
    "estimated_duration": 20,
    "distance": 8.5,
    "status": "pending",
    "created_at": "2024-01-01T10:30:00Z"
  },
  "available_drivers": [
    {
      "driver_profile": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "user_id": "880e8400-e29b-41d4-a716-446655440003",
        "vehicle_type": "sedan",
        "vehicle_model": "Toyota Corolla",
        "vehicle_color": "White",
        "vehicle_plate_number": "KAB 123C",
        "rating": 4.8,
        "total_trips": 150,
        "is_online": true
      },
      "user": {
        "full_name": "Jane Driver",
        "phone_number": "+254798765432"
      },
      "distance": 2.3
    }
  ]
}
```

---

### 6. Get Trip Details

**Endpoint:** `GET /trips/:id`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "driver_id": "880e8400-e29b-41d4-a716-446655440003",
  "pickup_address": "Nairobi CBD",
  "dropoff_address": "Westlands",
  "estimated_fare": 450.00,
  "actual_fare": 420.00,
  "status": "completed",
  "created_at": "2024-01-01T10:30:00Z",
  "completed_at": "2024-01-01T11:00:00Z"
}
```

---

### 7. Get My Trips

**Endpoint:** `GET /trips/my?limit=10&offset=0`

**Authentication:** Required

**Query Parameters:**
- `limit` (integer, optional): Number of trips to return (default: 10)
- `offset` (integer, optional): Offset for pagination (default: 0)

**Response:** `200 OK`
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "pickup_address": "Nairobi CBD",
    "dropoff_address": "Westlands",
    "actual_fare": 420.00,
    "created_at": "2024-01-01T10:30:00Z"
  }
]
```

---

### 8. Get Active Trip

**Endpoint:** `GET /trips/active`

**Authentication:** Required

**Response:** `200 OK` or `404 Not Found`

---

### 9. Cancel Trip

**Endpoint:** `POST /trips/:id/cancel`

**Authentication:** Required

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:** `200 OK`
```json
{
  "message": "Trip cancelled successfully"
}
```

---

## Driver Endpoints

### 10. Update Driver Status

**Endpoint:** `PUT /driver/status`

**Authentication:** Required (Driver role)

**Description:** Toggle online/offline status.

**Request Body:**
```json
{
  "is_online": true
}
```

**Response:** `200 OK`
```json
{
  "message": "Status updated successfully"
}
```

---

### 11. Update Driver Location

**Endpoint:** `PUT /driver/location`

**Authentication:** Required (Driver role)

**Description:** Update current location for matching with nearby ride requests.

**Request Body:**
```json
{
  "latitude": -1.286389,
  "longitude": 36.817223
}
```

**Response:** `200 OK`
```json
{
  "message": "Location updated successfully"
}
```

---

### 12. Get Pending Requests

**Endpoint:** `GET /driver/requests`

**Authentication:** Required (Driver role)

**Description:** Get list of pending ride requests.

**Response:** `200 OK`
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "pickup_address": "Nairobi CBD",
    "dropoff_address": "Westlands",
    "estimated_fare": 450.00,
    "distance": 8.5,
    "status": "pending",
    "created_at": "2024-01-01T10:30:00Z"
  }
]
```

---

### 13. Accept Trip

**Endpoint:** `POST /driver/trips/accept`

**Authentication:** Required (Driver role)

**Request Body:**
```json
{
  "trip_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:** `200 OK`
```json
{
  "message": "Trip accepted successfully"
}
```

---

### 14. Start Trip

**Endpoint:** `POST /driver/trips/:id/start`

**Authentication:** Required (Driver role)

**Response:** `200 OK`
```json
{
  "message": "Trip started successfully"
}
```

---

### 15. Complete Trip

**Endpoint:** `POST /driver/trips/:id/complete`

**Authentication:** Required (Driver role)

**Request Body:**
```json
{
  "actual_fare": 420.00,
  "actual_duration": 25,
  "payment_status": "paid"
}
```

**Fields:**
- `actual_fare` (number, required): Final trip fare
- `actual_duration` (integer, required): Trip duration in minutes
- `payment_status` (string, required): "paid", "pending", or "failed"

**Response:** `200 OK`
```json
{
  "message": "Trip completed successfully"
}
```

---

### 16. Cancel Trip (Driver)

**Endpoint:** `POST /driver/trips/:id/cancel`

**Authentication:** Required (Driver role)

**Request Body:**
```json
{
  "reason": "Vehicle breakdown"
}
```

**Response:** `200 OK`

---

### 17. Get Driver Trips

**Endpoint:** `GET /driver/trips/my?limit=10&offset=0`

**Authentication:** Required (Driver role)

**Response:** `200 OK`

---

### 18. Get Driver Active Trip

**Endpoint:** `GET /driver/trips/active`

**Authentication:** Required (Driver role)

**Response:** `200 OK` or `404 Not Found`

---

## Rating Endpoints

### 19. Create Rating

**Endpoint:** `POST /ratings`

**Authentication:** Required

**Description:** Rate a user or driver after trip completion.

**Request Body:**
```json
{
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "rated_id": "880e8400-e29b-41d4-a716-446655440003",
  "rating": 5,
  "feedback": "Excellent driver, very professional!"
}
```

**Fields:**
- `trip_id` (uuid, required): ID of the completed trip
- `rated_id` (uuid, required): ID of user being rated
- `rating` (integer, required): Rating from 1 to 5
- `feedback` (string, optional): Additional feedback

**Response:** `201 Created`
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "trip_id": "660e8400-e29b-41d4-a716-446655440001",
  "rater_id": "550e8400-e29b-41d4-a716-446655440000",
  "rated_id": "880e8400-e29b-41d4-a716-446655440003",
  "rating": 5,
  "feedback": "Excellent driver, very professional!",
  "created_at": "2024-01-01T11:05:00Z"
}
```

---

### 20. Get My Ratings

**Endpoint:** `GET /ratings/my?limit=10&offset=0`

**Authentication:** Required

**Description:** Get ratings received.

**Response:** `200 OK`
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "trip_id": "660e8400-e29b-41d4-a716-446655440001",
    "rating": 5,
    "feedback": "Great passenger!",
    "created_at": "2024-01-01T11:05:00Z"
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Trip Status Values

- `pending` - Trip requested, waiting for driver
- `accepted` - Driver accepted the trip
- `in_progress` - Trip is ongoing
- `completed` - Trip finished successfully
- `cancelled` - Trip was cancelled

## Payment Status Values

- `pending` - Payment not yet processed
- `paid` - Payment completed
- `failed` - Payment failed
