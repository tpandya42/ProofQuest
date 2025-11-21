# Database Schema Documentation
## Brand Challenge Mini App - PostgreSQL Schema

**Database Service:** Tiger Cloud (TimescaleDB)  
**Service ID:** `tiger_cloud_id`  
**Created:** November 5, 2025  
**PostgreSQL Version:** 17+ compatible

---

## Table of Contents
1. [Schema Overview](#schema-overview)
2. [Tables](#tables)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Best Practices Applied](#best-practices-applied)
6. [Sample Queries](#sample-queries)
7. [Connection Info](#connection-info)

---

## Schema Overview

The schema follows **PostgreSQL best practices** with proper normalization (3NF), comprehensive indexing, and referential integrity constraints.

### Entity-Relationship Diagram
```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    users    │         │   submissions    │         │ challenges  │
├─────────────┤         ├──────────────────┤         ├─────────────┤
│ user_id (PK)│◄────────│ submission_id(PK)│────────►│challenge_id │
│ telegram_id │         │ user_id (FK)     │         │  (PK)       │
│ username    │         │ challenge_id(FK) │         │ title       │
│ first_name  │         │ image_url        │         │ description │
│ last_name   │         │ created_at       │         │ image_url   │
│ photo_url   │         └──────────────────┘         │ reward_info │
│wallet_address│        UNIQUE(user_id,              │ deadline    │
│ created_at  │              challenge_id)           │ status      │
│ updated_at  │                                      │ created_at  │
└─────────────┘                                      │ updated_at  │
                                                     └─────────────┘
```

---

## Tables

### 1. **users** - Telegram User Identity & Wallet

Stores Telegram user information and optional TON wallet addresses.

| Column          | Type         | Constraints                      | Description                     |
|-----------------|--------------|----------------------------------|---------------------------------|
| `user_id`       | BIGINT       | PRIMARY KEY, IDENTITY            | Auto-incrementing user ID       |
| `telegram_id`   | BIGINT       | NOT NULL, UNIQUE                 | Telegram user ID (business key) |
| `username`      | TEXT         | NULL                             | Telegram username (@handle)     |
| `first_name`    | TEXT         | NULL                             | User's first name               |
| `last_name`     | TEXT         | NULL                             | User's last name                |
| `photo_url`     | TEXT         | NULL                             | Profile photo URL               |
| `wallet_address`| TEXT         | NULL                             | TON wallet address              |
| `created_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()          | Registration timestamp          |
| `updated_at`    | TIMESTAMPTZ  | NOT NULL, DEFAULT now()          | Last update timestamp           |

**Indexes:**
- `users_pkey` - Primary key on `user_id` (auto-created)
- `users_telegram_id_key` - Unique constraint on `telegram_id` (auto-created)
- `idx_users_telegram_id` - B-tree index on `telegram_id` for fast lookups
- `idx_users_created_at` - B-tree index for time-based queries

**Key Design Decisions:**
- Used `BIGINT IDENTITY` for primary key (not UUID) - simpler, faster
- Separate `telegram_id` as business key with UNIQUE constraint
- All string fields use `TEXT` (not VARCHAR) - PostgreSQL best practice
- `TIMESTAMPTZ` with timezone awareness for timestamps
- Nullable optional fields (username, names, photo, wallet)

---

### 2. **challenges** - Brand Challenges

Stores brand challenge definitions with status tracking.

| Column         | Type         | Constraints                           | Description                    |
|----------------|--------------|---------------------------------------|--------------------------------|
| `challenge_id` | BIGINT       | PRIMARY KEY, IDENTITY                 | Auto-incrementing challenge ID |
| `title`        | TEXT         | NOT NULL                              | Challenge title                |
| `description`  | TEXT         | NOT NULL                              | Instructions                   |
| `image_url`    | TEXT         | NOT NULL                              | Brand/example image            |
| `reward_info`  | TEXT         | NOT NULL                              | Reward description             |
| `deadline`     | TIMESTAMPTZ  | NOT NULL                              | Submission deadline            |
| `status`       | TEXT         | NOT NULL, DEFAULT 'active', CHECK     | 'active' or 'expired'          |
| `created_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()               | Creation timestamp             |
| `updated_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()               | Last update timestamp          |

**Indexes:**
- `challenges_pkey` - Primary key on `challenge_id`
- `idx_challenges_status` - For filtering active challenges
- `idx_challenges_deadline` - For deadline queries
- `idx_challenges_created_at` - For time-based queries

**Constraints:**
- CHECK constraint: `status IN ('active', 'expired')`

**Key Design Decisions:**
- Status enum implemented as TEXT + CHECK constraint (easier to modify than ENUM type)
- Comprehensive indexing on query patterns (status, deadline, created_at)
- All required fields marked NOT NULL

---

### 3. **submissions** - User Photo Submissions

Stores user submissions for challenges with one-per-user-per-challenge constraint.

| Column         | Type         | Constraints                           | Description                    |
|----------------|--------------|---------------------------------------|--------------------------------|
| `submission_id`| BIGINT       | PRIMARY KEY, IDENTITY                 | Auto-incrementing submission ID|
| `user_id`      | BIGINT       | NOT NULL, FK → users(user_id)         | Submitting user                |
| `challenge_id` | BIGINT       | NOT NULL, FK → challenges(challenge_id)| Target challenge              |
| `image_url`    | TEXT         | NOT NULL                              | Submitted photo URL            |
| `created_at`   | TIMESTAMPTZ  | NOT NULL, DEFAULT now()               | Submission timestamp           |

**Indexes:**
- `submissions_pkey` - Primary key on `submission_id`
- `submissions_user_id_challenge_id_key` - Unique constraint (auto-creates index)
- `idx_submissions_user_id` - **Critical FK index** for joins & cascades
- `idx_submissions_challenge_id` - **Critical FK index** for joins & cascades
- `idx_submissions_created_at` - For time-based queries

**Foreign Keys:**
- `user_id` → `users(user_id)` with `ON DELETE CASCADE`
- `challenge_id` → `challenges(challenge_id)` with `ON DELETE CASCADE`

**Constraints:**
- UNIQUE constraint on `(user_id, challenge_id)` - one submission per user per challenge

**Key Design Decisions:**
- **Foreign key indexes explicitly created** (PostgreSQL doesn't auto-index FKs!)
- CASCADE delete - removing user/challenge removes submissions
- Unique constraint enforces business rule at database level

---

## Relationships

### Foreign Key Relationships

```sql
submissions.user_id ──FK──> users.user_id
  ↳ ON DELETE CASCADE (deleting user removes their submissions)

submissions.challenge_id ──FK──> challenges.challenge_id
  ↳ ON DELETE CASCADE (deleting challenge removes all submissions)
```

### Cardinality

- **users ↔ submissions**: One-to-Many (1 user → N submissions)
- **challenges ↔ submissions**: One-to-Many (1 challenge → N submissions)
- **users ↔ challenges (via submissions)**: Many-to-Many with constraint (1 submission per pair)

---

## Indexes

### Summary: 13 Total Indexes

| Index Name                             | Table        | Columns              | Type    | Purpose                          |
|----------------------------------------|--------------|----------------------|---------|----------------------------------|
| `users_pkey`                           | users        | user_id              | B-tree  | Primary key (auto)               |
| `users_telegram_id_key`                | users        | telegram_id          | B-tree  | Unique constraint (auto)         |
| `idx_users_telegram_id`                | users        | telegram_id          | B-tree  | Fast login lookups               |
| `idx_users_created_at`                 | users        | created_at           | B-tree  | User registration analytics      |
| `challenges_pkey`                      | challenges   | challenge_id         | B-tree  | Primary key (auto)               |
| `idx_challenges_status`                | challenges   | status               | B-tree  | Filter active/expired            |
| `idx_challenges_deadline`              | challenges   | deadline             | B-tree  | Deadline sorting/filtering       |
| `idx_challenges_created_at`            | challenges   | created_at           | B-tree  | Challenge creation analytics     |
| `submissions_pkey`                     | submissions  | submission_id        | B-tree  | Primary key (auto)               |
| `submissions_user_id_challenge_id_key` | submissions  | user_id, challenge_id| B-tree  | Unique constraint (auto)         |
| `idx_submissions_user_id`              | submissions  | user_id              | B-tree  | **FK join performance**          |
| `idx_submissions_challenge_id`         | submissions  | challenge_id         | B-tree  | **FK join performance**          |
| `idx_submissions_created_at`           | submissions  | created_at           | B-tree  | Submission timeline queries      |

### Index Strategy

**Primary Keys** - Auto-indexed  
**Unique Constraints** - Auto-indexed  
**Foreign Keys** - Manually indexed (critical!)  
**Query Patterns** - Indexed on status, deadlines, timestamps  

---

## Best Practices Applied

### Data Type Choices

| What                  | Used              | Not Used         | Why                                |
|-----------------------|-------------------|------------------|------------------------------------|
| Primary Keys          | `BIGINT IDENTITY` | `SERIAL`, `UUID` | Simpler, faster, auto-increment    |
| Strings               | `TEXT`            | `VARCHAR(n)`     | PostgreSQL optimizes TEXT          |
| Timestamps            | `TIMESTAMPTZ`     | `TIMESTAMP`      | Timezone-aware (critical for global apps) |
| Enums                 | `TEXT + CHECK`    | `ENUM`           | Easier to modify without migrations|

### Constraint Strategy

- **NOT NULL** on all required fields
- **CHECK constraints** for status validation
- **UNIQUE constraints** for business rules
- **Foreign keys with CASCADE** for referential integrity

### Indexing Strategy

1. **Primary keys** - Auto-indexed by PostgreSQL
2. **Foreign keys** - **Manually indexed** (PostgreSQL gotcha!)
3. **Unique constraints** - Auto-indexed
4. **Query patterns** - Indexed on frequently filtered/sorted columns

### Normalization

- **3rd Normal Form (3NF)** - No redundancy, clean relationships
- **Proper foreign keys** - Referential integrity enforced
- **One source of truth** - User info in `users`, challenge info in `challenges`

### Performance Optimizations

- Comprehensive B-tree indexes on filter/sort columns
- Foreign key indexes prevent locking issues on cascading deletes
- TIMESTAMPTZ for efficient time-based queries
- BIGINT IDENTITY (faster than UUID for joins and indexes)

---

## Sample Queries

### Authentication: Login or Register User

```sql
-- Upsert user (insert or update on conflict)
INSERT INTO users (telegram_id, username, first_name, last_name, photo_url)
VALUES (123456789, 'fran42', 'Francisco', 'Lopez', 'https://t.me/i/userpic/320/fran.jpg')
ON CONFLICT (telegram_id) 
DO UPDATE SET 
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    photo_url = EXCLUDED.photo_url,
    updated_at = now()
RETURNING *;
```

### Link Wallet Address

```sql
UPDATE users
SET wallet_address = 'EQDrf...abc123', updated_at = now()
WHERE telegram_id = 123456789
RETURNING user_id, wallet_address;
```

### Get Active Challenges

```sql
SELECT challenge_id, title, description, image_url, reward_info, deadline, created_at
FROM challenges
WHERE status = 'active' AND deadline > now()
ORDER BY deadline ASC;
```

### Submit Photo

```sql
INSERT INTO submissions (user_id, challenge_id, image_url)
VALUES (1, 2, 'https://cdn.brandchallenge.com/uploads/xyz123.jpg')
ON CONFLICT (user_id, challenge_id) DO NOTHING
RETURNING *;
```

### Get User's Completed Challenges

```sql
SELECT 
    c.challenge_id,
    c.title as challenge_title,
    c.image_url as challenge_image,
    s.image_url as submission_image,
    s.created_at as submitted_at
FROM submissions s
JOIN challenges c ON s.challenge_id = c.challenge_id
WHERE s.user_id = (SELECT user_id FROM users WHERE telegram_id = 123456789)
ORDER BY s.created_at DESC;
```

### Get Challenge with Submission Count

```sql
SELECT 
    c.challenge_id,
    c.title,
    c.description,
    c.deadline,
    c.status,
    COUNT(s.submission_id) as total_submissions
FROM challenges c
LEFT JOIN submissions s ON c.challenge_id = s.challenge_id
WHERE c.status = 'active'
GROUP BY c.challenge_id
ORDER BY total_submissions DESC, c.deadline ASC;
```

### Check if User Already Submitted

```sql
SELECT EXISTS(
    SELECT 1 FROM submissions 
    WHERE user_id = 1 AND challenge_id = 2
) as already_submitted;
```

### User Leaderboard (Most Submissions)

```sql
SELECT 
    u.username,
    u.first_name,
    u.photo_url,
    COUNT(s.submission_id) as submission_count
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
GROUP BY u.user_id, u.username, u.first_name, u.photo_url
ORDER BY submission_count DESC
LIMIT 10;
```

---

## Connection Info

### Environment Variables

```bash
TIMESCALE_SERVICE_URL=postgres://username:password@host:port/database?sslmode=require
PGHOST=your_host
PGPORT=your_port
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password
```

### Python Connection Example

```python
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv('.env')
conn = psycopg2.connect(os.environ['TIMESCALE_SERVICE_URL'])
cursor = conn.cursor()

# Your queries here
cursor.execute("SELECT * FROM users LIMIT 1;")
print(cursor.fetchone())

cursor.close()
conn.close()
```

### FastAPI Connection Example (SQLAlchemy)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv('.env')

DATABASE_URL = os.environ['TIMESCALE_SERVICE_URL']

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Schema Evolution & Maintenance

### Adding New Columns (Safe)

```sql
-- Safe: Non-volatile defaults are fast
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN points INTEGER NOT NULL DEFAULT 0;

-- Requires table rewrite (avoid on large tables)
ALTER TABLE users ADD COLUMN uuid UUID DEFAULT gen_random_uuid();
```

### Creating Indexes Concurrently (Production-Safe)

```sql
-- Won't block writes (can't run in transaction)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### Dropping Tables (With CASCADE)

```sql
-- Removes dependent submissions automatically
DROP TABLE users CASCADE;
```

---

## Monitoring & Analytics Queries

### Table Sizes

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Index Usage Stats

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Unused Indexes (Consider Dropping)

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND idx_scan = 0
  AND indexrelid IS NOT NULL;
```

---

## Summary

**Schema Statistics:**
- 3 tables (users, challenges, submissions)
- 13 indexes (comprehensive coverage)
- 2 foreign keys with CASCADE delete
- 3 unique constraints
- 1 CHECK constraint (challenge status)
- Sample data included (3 users, 3 challenges, 3 submissions)

**Best Practices Followed:**
- Normalized to 3NF
- Proper PostgreSQL data types (TEXT, BIGINT, TIMESTAMPTZ)
- Foreign key indexes created (critical!)
- Comprehensive indexing strategy
- NOT NULL constraints on required fields
- Referential integrity with CASCADE
- Business rule enforcement (UNIQUE, CHECK)
- Timezone-aware timestamps

**Ready for Production:**
- Hosted on Tiger Cloud (TimescaleDB)
- Sample data for testing
- Connection examples provided
- Query patterns documented
- Monitoring queries included

---

**Created by:** GitHub Copilot  
**Date:** November 5, 2025  
**Database:** Tiger Cloud Service `tiger_cloud_id`
