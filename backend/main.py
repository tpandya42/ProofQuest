from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables (for local development)
load_dotenv('.env')

# Get database connection string
DATABASE_URL = os.environ.get('TIMESCALE_SERVICE_URL')

app = FastAPI(
    title="Brand Challenge API",
    description="Backend API for Brand Challenge Mini App - Telegram Integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Telegram Mini App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Telegram Mini App domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# CACHE CONTROL MIDDLEWARE
# ============================================================

@app.middleware("http")
async def add_cache_control_headers(request: Request, call_next):
    """
    Add cache-control headers to all responses to ensure fresh data.
    Prevents browsers and proxies from caching API responses.
    """
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )

# ============================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================

class UserLogin(BaseModel):
    telegram_id: int = Field(..., description="Telegram user ID")
    username: Optional[str] = Field(None, description="Telegram username")
    first_name: Optional[str] = Field(None, description="User's first name")
    last_name: Optional[str] = Field(None, description="User's last name")
    photo_url: Optional[str] = Field(None, description="Profile photo URL")

    class Config:
        json_schema_extra = {
            "example": {
                "telegram_id": 123456789,
                "username": "fran42",
                "first_name": "Francisco",
                "last_name": "Lopez",
                "photo_url": "https://t.me/i/userpic/320/fran.jpg"
            }
        }

class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    wallet_address: Optional[str]
    created_at: str

class WalletLink(BaseModel):
    telegram_id: int = Field(..., description="Telegram user ID")
    wallet_address: str = Field(..., description="TON wallet address")

    class Config:
        json_schema_extra = {
            "example": {
                "telegram_id": 123456789,
                "wallet_address": "EQDrf...abc123"
            }
        }

class SubmissionCreate(BaseModel):
    telegram_id: int = Field(..., description="Telegram user ID")
    challenge_id: int = Field(..., description="Challenge ID")
    image_url: str = Field(..., description="Uploaded image URL")

    class Config:
        json_schema_extra = {
            "example": {
                "telegram_id": 123456789,
                "challenge_id": 1,
                "image_url": "https://cdn.brandchallenge.com/uploads/xyz123.jpg"
            }
        }

class ChallengeResponse(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    reward_info: str
    deadline: str
    status: str

class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    image_url: str
    created_at: str

class UserSubmissionResponse(BaseModel):
    id: int
    challenge_id: int
    challenge_title: str
    image_url: str
    created_at: str

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/", tags=["Root"])
def root():
    """Root endpoint - API information"""
    return {
        "message": "Brand Challenge API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for Render monitoring"""
    try:
        # Test database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

# ============================================================
# USER ENDPOINTS
# ============================================================

@app.post("/users/login", response_model=UserResponse, tags=["Users"])
def login_user(user_data: UserLogin):
    """
    Login or register user via Telegram authentication.
    
    This endpoint performs an upsert operation:
    - If user exists: updates their information
    - If user doesn't exist: creates a new user
    
    Returns user data including user_id for subsequent API calls.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Upsert user data
        cursor.execute("""
            INSERT INTO users (telegram_id, username, first_name, last_name, photo_url)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (telegram_id) 
            DO UPDATE SET 
                username = EXCLUDED.username,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                photo_url = EXCLUDED.photo_url,
                updated_at = now()
            RETURNING user_id, telegram_id, username, wallet_address, created_at;
        """, (
            user_data.telegram_id,
            user_data.username,
            user_data.first_name,
            user_data.last_name,
            user_data.photo_url
        ))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            "id": result['user_id'],
            "telegram_id": result['telegram_id'],
            "username": result['username'],
            "wallet_address": result['wallet_address'],
            "created_at": result['created_at'].isoformat()
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error logging in user: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/users/wallet", tags=["Users"])
def link_wallet(wallet_data: WalletLink):
    """
    Link TON wallet address to user account.
    
    Updates user's wallet address for future reward distribution.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Update wallet address
        cursor.execute("""
            UPDATE users
            SET wallet_address = %s, updated_at = now()
            WHERE telegram_id = %s
            RETURNING user_id;
        """, (wallet_data.wallet_address, wallet_data.telegram_id))
        
        result = cursor.fetchone()
        
        if not result:
            conn.rollback()
            raise HTTPException(status_code=404, detail="User not found")
        
        conn.commit()
        
        return {
            "message": "Wallet linked successfully",
            "wallet_address": wallet_data.wallet_address
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error linking wallet: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ============================================================
# CHALLENGE ENDPOINTS
# ============================================================

@app.get("/challenges", response_model=List[ChallengeResponse], tags=["Challenges"])
def get_challenges():
    """
    Get all active challenges.
    
    Returns challenges that are:
    - Status = 'active'
    - Deadline has not passed
    
    Sorted by deadline (earliest first).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                challenge_id, 
                title, 
                description, 
                image_url, 
                reward_info, 
                deadline, 
                status
            FROM challenges
            WHERE status = 'active' AND deadline > now()
            ORDER BY deadline ASC;
        """)
        
        challenges = cursor.fetchall()
        
        return [
            {
                "id": c['challenge_id'],
                "title": c['title'],
                "description": c['description'],
                "image_url": c['image_url'],
                "reward_info": c['reward_info'],
                "deadline": c['deadline'].isoformat(),
                "status": c['status']
            }
            for c in challenges
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching challenges: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/challenges/{challenge_id}", response_model=ChallengeResponse, tags=["Challenges"])
def get_challenge(challenge_id: int):
    """
    Get details for a specific challenge.
    
    Returns full challenge information including deadline and reward details.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                challenge_id, 
                title, 
                description, 
                image_url, 
                reward_info, 
                deadline, 
                status
            FROM challenges
            WHERE challenge_id = %s;
        """, (challenge_id,))
        
        challenge = cursor.fetchone()
        
        if not challenge:
            raise HTTPException(status_code=404, detail="Challenge not found")
        
        return {
            "id": challenge['challenge_id'],
            "title": challenge['title'],
            "description": challenge['description'],
            "image_url": challenge['image_url'],
            "reward_info": challenge['reward_info'],
            "deadline": challenge['deadline'].isoformat(),
            "status": challenge['status']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching challenge: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ============================================================
# SUBMISSION ENDPOINTS
# ============================================================

@app.post("/submissions", response_model=SubmissionResponse, tags=["Submissions"])
def submit_photo(submission_data: SubmissionCreate):
    """
    Submit a photo for a challenge.
    
    Business rules:
    - User can only submit once per challenge
    - Duplicate submissions return 400 error
    - User must exist (from /users/login)
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get user_id from telegram_id
        cursor.execute("""
            SELECT user_id FROM users WHERE telegram_id = %s;
        """, (submission_data.telegram_id,))
        
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found. Please login first.")
        
        user_id = user['user_id']
        
        # Check if already submitted
        cursor.execute("""
            SELECT submission_id FROM submissions
            WHERE user_id = %s AND challenge_id = %s;
        """, (user_id, submission_data.challenge_id))
        
        existing = cursor.fetchone()
        
        if existing:
            raise HTTPException(
                status_code=400, 
                detail="You have already submitted to this challenge"
            )
        
        # Create submission
        cursor.execute("""
            INSERT INTO submissions (user_id, challenge_id, image_url)
            VALUES (%s, %s, %s)
            RETURNING submission_id, user_id, challenge_id, image_url, created_at;
        """, (user_id, submission_data.challenge_id, submission_data.image_url))
        
        result = cursor.fetchone()
        conn.commit()
        
        return {
            "id": result['submission_id'],
            "user_id": result['user_id'],
            "challenge_id": result['challenge_id'],
            "image_url": result['image_url'],
            "created_at": result['created_at'].isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error submitting photo: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/submissions/user/{telegram_id}", response_model=List[UserSubmissionResponse], tags=["Submissions"])
def get_user_submissions(telegram_id: int):
    """
    Get all submissions for a specific user.
    
    Returns list of submissions with challenge details.
    Sorted by submission date (most recent first).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                s.submission_id,
                c.challenge_id,
                c.title as challenge_title,
                s.image_url,
                s.created_at
            FROM submissions s
            JOIN challenges c ON s.challenge_id = c.challenge_id
            JOIN users u ON s.user_id = u.user_id
            WHERE u.telegram_id = %s
            ORDER BY s.created_at DESC;
        """, (telegram_id,))
        
        submissions = cursor.fetchall()
        
        return [
            {
                "id": s['submission_id'],
                "challenge_id": s['challenge_id'],
                "challenge_title": s['challenge_title'],
                "image_url": s['image_url'],
                "created_at": s['created_at'].isoformat()
            }
            for s in submissions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching submissions: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ============================================================
# ANALYTICS ENDPOINTS (BONUS)
# ============================================================

@app.get("/leaderboard", tags=["Analytics"])
def get_leaderboard(limit: int = 10):
    """
    Get user leaderboard by submission count.
    
    Returns top users sorted by number of submissions.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                u.username,
                u.first_name,
                u.photo_url,
                COUNT(s.submission_id) as submission_count
            FROM users u
            LEFT JOIN submissions s ON u.user_id = s.user_id
            GROUP BY u.user_id, u.username, u.first_name, u.photo_url
            ORDER BY submission_count DESC, u.created_at ASC
            LIMIT %s;
        """, (limit,))
        
        leaderboard = cursor.fetchall()
        
        return [
            {
                "username": l['username'],
                "first_name": l['first_name'],
                "photo_url": l['photo_url'],
                "submission_count": l['submission_count']
            }
            for l in leaderboard
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/stats", tags=["Analytics"])
def get_stats():
    """
    Get overall platform statistics.
    
    Returns total counts for users, challenges, and submissions.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM challenges WHERE status='active') as active_challenges,
                (SELECT COUNT(*) FROM submissions) as total_submissions;
        """)
        
        stats = cursor.fetchone()
        
        return {
            "total_users": stats['total_users'],
            "active_challenges": stats['active_challenges'],
            "total_submissions": stats['total_submissions']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# ============================================================
# RUN SERVER (for local development)
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)