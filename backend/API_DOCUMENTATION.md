# API Documentation - Brand Challenge Backend

## Base URL

**Local Development:** `http://localhost:8000`  
**Production (Render):** `https://brand-challenge-backend.onrender.com`

---

## Interactive Documentation

Once the server is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## Endpoints Overview

### Root & Health
- `GET /` - API information
- `GET /health` - Health check (for Render monitoring)

### Users
- `POST /users/login` - Login or register user
- `POST /users/wallet` - Link TON wallet address

### Challenges
- `GET /challenges` - Get all active challenges
- `GET /challenges/{challenge_id}` - Get specific challenge details

### Submissions
- `POST /submissions` - Submit photo for a challenge
- `GET /submissions/user/{telegram_id}` - Get user's submissions

### Analytics (Bonus)
- `GET /leaderboard?limit=10` - Get top users by submission count
- `GET /stats` - Get platform statistics

---

## Authentication

Uses **Telegram Mini App authentication**:
- No JWT or API keys needed
- User identified by `telegram_id` from Telegram WebApp SDK
- First call to `/users/login` creates or updates user

---

## Detailed Endpoints

### 1. Root Endpoint

**GET** `/`

Returns API information.

**Response (200 OK):**
```json
{
  "message": "Brand Challenge API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs",
  "health": "/health"
}
```

---

### 2. Health Check

**GET** `/health`

Health check endpoint for monitoring (required by Render).

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production",
  "timestamp": "2025-11-05T16:30:00.000000"
}
```

**Response (503 Service Unavailable):**
```json
{
  "detail": "Service unhealthy: Database connection failed"
}
```

---

### 3. User Login/Registration

**POST** `/users/login`

Login or register user (upsert operation).

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "username": "fran42",
  "first_name": "Francisco",
  "last_name": "Lopez",
  "photo_url": "https://t.me/i/userpic/320/fran.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "fran42",
  "wallet_address": null,
  "created_at": "2025-11-05T12:30:00.000000Z"
}
```

**Notes:**
- If user exists: updates username, name, photo
- If user doesn't exist: creates new user
- Returns `user_id` for internal use

---

### 4. Link Wallet

**POST** `/users/wallet`

Link TON wallet address to user account.

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "wallet_address": "EQDrf...abc123"
}
```

**Response (200 OK):**
```json
{
  "message": "Wallet linked successfully",
  "wallet_address": "EQDrf...abc123"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "User not found"
}
```

---

### 5. Get Active Challenges

**GET** `/challenges`

Returns all active challenges with deadline not passed.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Coca-Cola Shelf Hunt",
    "description": "Take a picture of the supermarket shelf where Coca-Cola bottles are displayed.",
    "image_url": "https://cdn.brandchallenge.com/coca.jpg",
    "reward_info": "Earn 10 points",
    "deadline": "2025-11-10T23:59:59+00:00",
    "status": "active"
  },
  {
    "id": 2,
    "title": "Pepsi Display Spot",
    "description": "Find a Pepsi shelf and capture it fully.",
    "image_url": "https://cdn.brandchallenge.com/pepsi.jpg",
    "reward_info": "Earn 15 points",
    "deadline": "2025-11-08T23:59:59+00:00",
    "status": "active"
  }
]
```

**Notes:**
- Sorted by deadline (earliest first)
- Only returns challenges with status='active' and future deadline

---

### 6. Get Challenge Details

**GET** `/challenges/{challenge_id}`

Returns detailed information for a specific challenge.

**Path Parameters:**
- `challenge_id` (int) - Challenge ID

**Response (200 OK):**
```json
{
  "id": 1,
  "title": "Coca-Cola Shelf Hunt",
  "description": "Take a picture of the supermarket shelf where Coca-Cola bottles are displayed.",
  "image_url": "https://cdn.brandchallenge.com/coca.jpg",
  "reward_info": "Earn 10 points",
  "deadline": "2025-11-10T23:59:59+00:00",
  "status": "active"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Challenge not found"
}
```

---

### 7. Submit Photo

**POST** `/submissions`

Submit a photo for a challenge.

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "challenge_id": 1,
  "image_url": "https://cdn.brandchallenge.com/uploads/xyz123.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "user_id": 1,
  "challenge_id": 1,
  "image_url": "https://cdn.brandchallenge.com/uploads/xyz123.jpg",
  "created_at": "2025-11-05T15:40:00.000000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "You have already submitted to this challenge"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "User not found. Please login first."
}
```

**Notes:**
- One submission per user per challenge (enforced by UNIQUE constraint)
- Must call `/users/login` first to create user

---

### 8. Get User Submissions

**GET** `/submissions/user/{telegram_id}`

Returns all submissions for a specific user.

**Path Parameters:**
- `telegram_id` (int) - Telegram user ID

**Response (200 OK):**
```json
[
  {
    "id": 10,
    "challenge_id": 1,
    "challenge_title": "Coca-Cola Shelf Hunt",
    "image_url": "https://cdn.brandchallenge.com/uploads/xyz123.jpg",
    "created_at": "2025-11-05T15:40:00.000000Z"
  },
  {
    "id": 11,
    "challenge_id": 2,
    "challenge_title": "Pepsi Display Spot",
    "image_url": "https://cdn.brandchallenge.com/uploads/abc456.jpg",
    "created_at": "2025-11-05T16:20:00.000000Z"
  }
]
```

**Notes:**
- Sorted by submission date (most recent first)
- Returns empty array if user has no submissions

---

### 9. Leaderboard

**GET** `/leaderboard?limit=10`

Returns top users by submission count.

**Query Parameters:**
- `limit` (int, optional) - Number of users to return (default: 10)

**Response (200 OK):**
```json
[
  {
    "username": "fran42",
    "first_name": "Francisco",
    "photo_url": "https://t.me/i/userpic/320/fran.jpg",
    "submission_count": 15
  },
  {
    "username": "maria_g",
    "first_name": "Maria",
    "photo_url": "https://t.me/i/userpic/320/maria.jpg",
    "submission_count": 12
  }
]
```

**Notes:**
- Sorted by submission count (highest first)
- Ties broken by registration date (earliest first)

---

### 10. Platform Statistics

**GET** `/stats`

Returns overall platform statistics.

**Response (200 OK):**
```json
{
  "total_users": 150,
  "active_challenges": 5,
  "total_submissions": 423
}
```

---

## Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `400 Bad Request` - Invalid input or business rule violation
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Database connection issue

---

## Frontend Integration Example

### JavaScript/TypeScript

```javascript
const API_BASE_URL = "https://brand-challenge-backend.onrender.com";

// 1. Login user
async function loginUser(telegramUser) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            photo_url: telegramUser.photo_url
        })
    });
    return await response.json();
}

// 2. Get active challenges
async function getChallenges() {
    const response = await fetch(`${API_BASE_URL}/challenges`);
    return await response.json();
}

// 3. Submit photo
async function submitPhoto(telegramId, challengeId, imageUrl) {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            telegram_id: telegramId,
            challenge_id: challengeId,
            image_url: imageUrl
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
    }
    
    return await response.json();
}

// 4. Get user submissions
async function getUserSubmissions(telegramId) {
    const response = await fetch(`${API_BASE_URL}/submissions/user/${telegramId}`);
    return await response.json();
}
```

### Python

```python
import requests

API_BASE_URL = "https://brand-challenge-backend.onrender.com"

# Login user
def login_user(telegram_id, username, first_name):
    response = requests.post(
        f"{API_BASE_URL}/users/login",
        json={
            "telegram_id": telegram_id,
            "username": username,
            "first_name": first_name
        }
    )
    return response.json()

# Get challenges
def get_challenges():
    response = requests.get(f"{API_BASE_URL}/challenges")
    return response.json()

# Submit photo
def submit_photo(telegram_id, challenge_id, image_url):
    response = requests.post(
        f"{API_BASE_URL}/submissions",
        json={
            "telegram_id": telegram_id,
            "challenge_id": challenge_id,
            "image_url": image_url
        }
    )
    return response.json()
```

---

## Testing

### 1. Run the Server Locally

```bash
cd /home/alramire/ProofQuest/backend-proof-quest
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Run Automated Tests

```bash
# In another terminal
python3 test_api.py
```

### 3. Manual Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Get challenges
curl http://localhost:8000/challenges

# Login user
curl -X POST http://localhost:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{"telegram_id":123456789,"username":"test","first_name":"Test"}'

# Submit photo
curl -X POST http://localhost:8000/submissions \
  -H "Content-Type: application/json" \
  -d '{"telegram_id":123456789,"challenge_id":1,"image_url":"https://example.com/photo.jpg"}'
```

---

## Performance Notes

- Database connection pooling enabled (5 connections, max 10 overflow)
- Pre-ping enabled for connection validation
- Optimized queries with proper indexes
- All foreign key joins indexed
- Response caching headers configured
- Efficient query patterns with minimal N+1 queries

---

## Security

- CORS enabled (configure `allow_origins` for production)
- SSL/TLS for database connections (`sslmode=require`)
- Input validation via Pydantic models
- SQL injection protection (parameterized queries)
- Environment variables for sensitive data
- No sensitive data in error responses
- Rate limiting recommended for production

---

## Support

- **Swagger UI:** http://localhost:8000/docs
- **Project Documentation:** See `DATABASE_SCHEMA.md`
- **SQL Queries:** See `queries.sql`
- **Deployment Guide:** See `DEPLOYMENT_QUICKSTART.md`
