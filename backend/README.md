# ProofQuest Backend

FastAPI backend service for the ProofQuest Telegram Mini App. Provides RESTful API endpoints for user authentication, challenge management, photo submissions, and AI-powered verification.

## Overview

The backend is built with FastAPI and uses PostgreSQL (TimescaleDB) for data storage. It handles user authentication via Telegram credentials, manages brand challenges, processes photo submissions, and integrates with Google's Gemini AI for automated verification.

## Technology Stack

- **Framework**: FastAPI 
- **Database**: PostgreSQL 17+ with TimescaleDB
- **Database Driver**: psycopg2-binary
- **ORM**: SQLAlchemy
- **Environment Management**: python-dotenv
- **Hosting**: Render
- **Python Version**: 3.10+

## Project Structure

```
backend/
├── main.py                      # FastAPI application and endpoints
├── database.py                  # Database connection and models
├── requirements.txt             # Python dependencies
├── test_api.py                 # API endpoint tests
├── queries.sql                 # SQL query examples
├── render.yaml                 # Render deployment configuration
├── API_DOCUMENTATION.md        # Complete API reference
├── DATABASE_SCHEMA.md          # Database schema documentation
├── DEPLOYMENT_QUICKSTART.md    # Quick deployment guide
└── README_DATABASE.md          # Database setup guide
```

## Features

### Core Functionality
- User authentication via Telegram Mini App
- TON wallet address linking
- Challenge creation and management
- Photo submission handling
- AI-powered submission verification
- User submission history
- Leaderboard and statistics

### API Capabilities
- RESTful endpoint design
- Automatic OpenAPI documentation (Swagger UI)
- CORS support for Telegram Mini Apps
- Cache control headers for fresh data
- Health monitoring endpoint
- Comprehensive error handling

### Database Features
- PostgreSQL best practices (3NF normalization)
- Comprehensive indexing for performance
- Foreign key constraints for data integrity
- Timestamp tracking with timezone awareness
- Efficient query patterns with proper joins

## Installation

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- PostgreSQL database access (local or Tiger Cloud)
- Git

### Setup Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ProofQuest/backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate     # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   
   Create a `.env` file:
   ```
   TIMESCALE_SERVICE_URL=postgres://username:password@host:port/database
   PGHOST=your_host
   PGPORT=your_port
   PGDATABASE=your_database
   PGUSER=your_username
   PGPASSWORD=your_password
   ```

5. Initialize the database schema:
   ```bash
   python create_schema.py
   ```

6. (Optional) Populate with sample data:
   ```bash
   python populate_dummy_data.py
   ```

## Running the Server

### Development Mode

Run the server with auto-reload enabled:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- Base URL: `http://localhost:8000`
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- Alternative docs (ReDoc): `http://localhost:8000/redoc`

### Production Mode

For production deployment:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TIMESCALE_SERVICE_URL` | Full PostgreSQL connection string | Yes |
| `PGHOST` | Database host address | Yes |
| `PGPORT` | Database port (default: 5432) | Yes |
| `PGDATABASE` | Database name | Yes |
| `PGUSER` | Database username | Yes |
| `PGPASSWORD` | Database password | Yes |

### CORS Configuration

CORS is configured in `main.py` to allow requests from Telegram Mini Apps. For production, update the `allow_origins` list with your specific domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-telegram-mini-app-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## API Endpoints

### Root & Health

#### GET /
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Brand Challenge API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs",
  "health": "/health"
}
```

#### GET /health
Health check endpoint for monitoring services.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production",
  "timestamp": "2025-11-10T12:00:00.000000"
}
```

### User Endpoints

#### POST /users/login
Login or register a user with Telegram credentials.

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "photo_url": "https://t.me/i/userpic/..."
}
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "photo_url": "https://t.me/i/userpic/...",
  "wallet_address": null,
  "created_at": "2025-11-10T12:00:00Z"
}
```

#### POST /users/wallet
Link or update a TON wallet address for a user.

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "wallet_address": "UQD..."
}
```

**Response:**
```json
{
  "message": "Wallet linked successfully",
  "wallet_address": "UQD..."
}
```

### Challenge Endpoints

#### GET /challenges
Get all active challenges.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Coca-Cola Display Hunt",
    "description": "Find and photograph a Coca-Cola display in any store",
    "image_url": "https://example.com/coca-cola.jpg",
    "reward_info": "10 points",
    "deadline": "2025-12-31T23:59:59Z",
    "status": "active",
    "created_at": "2025-11-01T00:00:00Z"
  }
]
```

#### GET /challenges/{challenge_id}
Get details of a specific challenge.

**Response:**
```json
{
  "id": 1,
  "title": "Coca-Cola Display Hunt",
  "description": "Find and photograph a Coca-Cola display in any store",
  "image_url": "https://example.com/coca-cola.jpg",
  "reward_info": "10 points",
  "deadline": "2025-12-31T23:59:59Z",
  "status": "active",
  "created_at": "2025-11-01T00:00:00Z"
}
```

### Submission Endpoints

#### POST /submissions
Submit a photo for a challenge.

**Request Body:**
```json
{
  "user_id": 1,
  "challenge_id": 1,
  "image_url": "https://example.com/submission.jpg"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "challenge_id": 1,
  "image_url": "https://example.com/submission.jpg",
  "created_at": "2025-11-10T12:00:00Z"
}
```

#### GET /submissions/user/{telegram_id}
Get all submissions for a specific user.

**Response:**
```json
[
  {
    "id": 1,
    "challenge_id": 1,
    "challenge_title": "Coca-Cola Display Hunt",
    "image_url": "https://example.com/submission.jpg",
    "created_at": "2025-11-10T12:00:00Z"
  }
]
```

### Analytics Endpoints

#### GET /leaderboard
Get top users by submission count.

**Query Parameters:**
- `limit` (optional, default: 10): Number of users to return

**Response:**
```json
[
  {
    "telegram_id": 123456789,
    "username": "john_doe",
    "first_name": "John",
    "submission_count": 15
  }
]
```

#### GET /stats
Get platform statistics.

**Response:**
```json
{
  "total_users": 100,
  "total_challenges": 10,
  "active_challenges": 7,
  "total_submissions": 250
}
```

## Database Schema

### Tables

#### users
Stores Telegram user information and TON wallet addresses.

| Column | Type | Constraints |
|--------|------|-------------|
| user_id | BIGINT | PRIMARY KEY, IDENTITY |
| telegram_id | BIGINT | NOT NULL, UNIQUE |
| username | TEXT | NULL |
| first_name | TEXT | NULL |
| last_name | TEXT | NULL |
| photo_url | TEXT | NULL |
| wallet_address | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### challenges
Stores brand challenge definitions.

| Column | Type | Constraints |
|--------|------|-------------|
| challenge_id | BIGINT | PRIMARY KEY, IDENTITY |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| image_url | TEXT | NOT NULL |
| reward_info | TEXT | NOT NULL |
| deadline | TIMESTAMPTZ | NOT NULL |
| status | TEXT | NOT NULL, DEFAULT 'active' |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

#### submissions
Stores user photo submissions.

| Column | Type | Constraints |
|--------|------|-------------|
| submission_id | BIGINT | PRIMARY KEY, IDENTITY |
| user_id | BIGINT | NOT NULL, FK to users |
| challenge_id | BIGINT | NOT NULL, FK to challenges |
| image_url | TEXT | NOT NULL |
| image_data | TEXT | NULL |
| image_mime_type | TEXT | NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

**Unique Constraint**: One submission per user per challenge

#### verification_logs
Audit trail for AI verification attempts.

| Column | Type | Description |
|--------|------|-------------|
| log_id | BIGINT | PRIMARY KEY, IDENTITY |
| submission_id | BIGINT | FK to submissions |
| verification_result | TEXT | APPROVED/REJECTED/API_ERROR |
| ai_model_used | TEXT | AI model identifier |
| ai_prompt | TEXT | Prompt sent to AI |
| ai_raw_response | TEXT | Raw AI response |
| error_message | TEXT | Error details if failed |
| api_call_duration_ms | INTEGER | Performance metric |
| created_at | TIMESTAMPTZ | Verification timestamp |

### Indexes

The database includes comprehensive indexing for optimal query performance:

- Primary key indexes on all tables
- Unique index on `users.telegram_id`
- Index on `challenges.status` for filtering active challenges
- Index on `challenges.deadline` for time-based queries
- Index on `submissions.user_id` for user history lookups
- Index on `submissions.challenge_id` for challenge submissions
- Composite index on `submissions(user_id, challenge_id)`

## Testing

### API Tests

Run the API test suite:

```bash
python test_api.py
```

This tests:
- User login/registration
- Challenge retrieval
- Submission creation
- User submission history
- Leaderboard functionality
- Statistics endpoints

### Cache Header Tests

Verify cache control headers:

```bash
python test_cache_headers.py
```

### Manual Testing

Use the interactive API documentation:

1. Start the server
2. Navigate to `http://localhost:8000/docs`
3. Test endpoints directly in the Swagger UI

## Deployment

### Render Deployment

The backend is configured for deployment on Render.

#### Prerequisites
- Render account
- GitHub repository
- Tiger Cloud database (or other PostgreSQL instance)

#### Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Web Service on Render**:
   - Go to https://dashboard.render.com
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` configuration

3. **Configure Environment Variables**:
   In the Render dashboard, add:
   ```
   TIMESCALE_SERVICE_URL=<your_database_url>
   PGHOST=<your_host>
   PGPORT=<your_port>
   PGDATABASE=<your_database>
   PGUSER=<your_username>
   PGPASSWORD=<your_password>
   ```

4. **Deploy**:
   - Click "Create Web Service"
   - Wait for build and deployment to complete
   - Your API will be available at the provided Render URL

5. **Verify Deployment**:
   ```bash
   curl https://your-app.onrender.com/health
   ```

#### Production URL
Current deployment: `https://your-app.onrender.com`

### Database Setup on Tiger Cloud

1. Create a TimescaleDB service on Tiger Cloud
2. Note the connection credentials
3. Run the schema creation script:
   ```bash
   python create_schema.py
   ```
4. Optionally populate sample data:
   ```bash
   python populate_dummy_data.py
   ```

## Performance Considerations

### Database Optimization
- Comprehensive indexing on frequently queried columns
- Foreign key constraints for data integrity
- Connection pooling for efficient database access
- Parameterized queries to prevent SQL injection

### API Optimization
- Cache control headers prevent stale data
- Efficient query patterns with proper joins
- Response pagination for large datasets
- Minimal response payloads

### Monitoring
- Health check endpoint for uptime monitoring
- Error logging and tracking
- Database connection status validation
- Request/response timing

## Security

### Best Practices Implemented
- No password storage (Telegram authentication only)
- Environment variables for sensitive data
- Database credentials not committed to git
- SQL injection prevention via parameterized queries
- CORS restrictions for API access
- Input validation on all endpoints

### Environment Security
- `.gitignore` configured to exclude credentials
- Separate environment files for local and production
- Secure connection strings with SSL for database

## Troubleshooting

### Common Issues

#### Database Connection Failed
**Solution**: Verify environment variables are correctly set and the database is accessible.

```bash
python -c "from database import test_connection; test_connection()"
```

#### Port Already in Use
**Solution**: Change the port or stop the conflicting process.

```bash
uvicorn main:app --reload --port 8001
```

#### Import Errors
**Solution**: Ensure all dependencies are installed.

```bash
pip install -r requirements.txt
```

#### CORS Issues
**Solution**: Update the `allow_origins` in `main.py` to include your frontend domain.

### Debug Mode

Enable debug logging by modifying the uvicorn command:

```bash
uvicorn main:app --reload --log-level debug
```

## Development Workflow

1. Create a feature branch
2. Make changes to the code
3. Test locally using the test suite
4. Update documentation if needed
5. Commit and push changes
6. Deploy to Render (automatically via GitHub integration)

## API Documentation

For complete API documentation, see:
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Detailed endpoint reference
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database structure and queries
- Interactive docs at `/docs` when server is running

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Render Documentation](https://render.com/docs)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)

## Support

For issues or questions:
1. Check the documentation in this directory
2. Review the API documentation at `/docs`
3. Check the troubleshooting section
4. Review the deployment guides

## License

This project is private and proprietary.
