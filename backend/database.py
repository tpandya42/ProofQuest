"""
FastAPI Database Models & Connection Setup
Brand Challenge Mini App - Example Implementation
"""

from sqlalchemy import create_engine, Column, BigInteger, Text, TIMESTAMP, CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

# Load database credentials
load_dotenv('.env')
DATABASE_URL = os.environ['TIMESCALE_SERVICE_URL']

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============================================================
# SQLAlchemy Models
# ============================================================

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(BigInteger, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(Text, nullable=True)
    first_name = Column(Text, nullable=True)
    last_name = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    wallet_address = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")


class Challenge(Base):
    __tablename__ = "challenges"
    
    challenge_id = Column(BigInteger, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(Text, nullable=False)
    reward_info = Column(Text, nullable=False)
    deadline = Column(TIMESTAMP(timezone=True), nullable=False)
    status = Column(Text, nullable=False, default='active', index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        CheckConstraint("status IN ('active', 'expired')", name='challenges_status_check'),
    )
    
    # Relationships
    submissions = relationship("Submission", back_populates="challenge", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"
    
    submission_id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False, index=True)
    challenge_id = Column(BigInteger, ForeignKey('challenges.challenge_id', ondelete='CASCADE'), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'challenge_id', name='submissions_user_id_challenge_id_key'),
    )
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    challenge = relationship("Challenge", back_populates="submissions")


# ============================================================
# Database Dependency for FastAPI
# ============================================================

def get_db():
    """
    Dependency function for FastAPI routes.
    Usage:
        @app.get("/users/{telegram_id}")
        def get_user(telegram_id: int, db: Session = Depends(get_db)):
            return db.query(User).filter(User.telegram_id == telegram_id).first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# Example FastAPI Endpoints (Paste into main.py)
# ============================================================

"""
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from pydantic import BaseModel
from database import get_db, User, Challenge, Submission

app = FastAPI()

# ============================================================
# Pydantic Schemas
# ============================================================

class UserLogin(BaseModel):
    telegram_id: int
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    photo_url: str | None = None

class UserResponse(BaseModel):
    user_id: int
    telegram_id: int
    username: str | None
    wallet_address: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChallengeResponse(BaseModel):
    challenge_id: int
    title: str
    description: str
    image_url: str
    reward_info: str
    deadline: datetime
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    telegram_id: int
    challenge_id: int
    image_url: str

class SubmissionResponse(BaseModel):
    submission_id: int
    user_id: int
    challenge_id: int
    image_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================
# API Endpoints
# ============================================================

@app.post("/users/login", response_model=UserResponse)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    '''Login or register a user via Telegram data'''
    # Check if user exists
    user = db.query(User).filter(User.telegram_id == user_data.telegram_id).first()
    
    if user:
        # Update existing user
        user.username = user_data.username
        user.first_name = user_data.first_name
        user.last_name = user_data.last_name
        user.photo_url = user_data.photo_url
        user.updated_at = datetime.now()
    else:
        # Create new user
        user = User(
            telegram_id=user_data.telegram_id,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            photo_url=user_data.photo_url
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    return user


@app.post("/users/wallet")
def link_wallet(telegram_id: int, wallet_address: str, db: Session = Depends(get_db)):
    '''Link a TON wallet to a user'''
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.wallet_address = wallet_address
    user.updated_at = datetime.now()
    db.commit()
    
    return {"message": "Wallet linked successfully"}


@app.get("/challenges", response_model=List[ChallengeResponse])
def get_active_challenges(db: Session = Depends(get_db)):
    '''Get all active challenges'''
    challenges = db.query(Challenge).filter(
        Challenge.status == 'active',
        Challenge.deadline > datetime.now()
    ).order_by(Challenge.deadline).all()
    
    return challenges


@app.get("/challenges/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(challenge_id: int, db: Session = Depends(get_db)):
    '''Get challenge details'''
    challenge = db.query(Challenge).filter(Challenge.challenge_id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


@app.post("/submissions", response_model=SubmissionResponse)
def submit_photo(submission: SubmissionCreate, db: Session = Depends(get_db)):
    '''Submit a photo for a challenge'''
    # Get user
    user = db.query(User).filter(User.telegram_id == submission.telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already submitted
    existing = db.query(Submission).filter(
        Submission.user_id == user.user_id,
        Submission.challenge_id == submission.challenge_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted to this challenge")
    
    # Create submission
    new_submission = Submission(
        user_id=user.user_id,
        challenge_id=submission.challenge_id,
        image_url=submission.image_url
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    
    return new_submission


@app.get("/submissions/user/{telegram_id}")
def get_user_submissions(telegram_id: int, db: Session = Depends(get_db)):
    '''Get all submissions by a user'''
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    submissions = db.query(
        Submission.submission_id,
        Challenge.challenge_id,
        Challenge.title.label('challenge_title'),
        Submission.image_url,
        Submission.created_at
    ).join(Challenge).filter(
        Submission.user_id == user.user_id
    ).order_by(Submission.created_at.desc()).all()
    
    return [
        {
            "id": s.submission_id,
            "challenge_id": s.challenge_id,
            "challenge_title": s.challenge_title,
            "image_url": s.image_url,
            "created_at": s.created_at
        }
        for s in submissions
    ]
"""
