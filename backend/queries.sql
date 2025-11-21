-- ============================================================
-- Brand Challenge Mini App - Essential SQL Queries
-- Database: Tiger Cloud Service 
-- ============================================================

-- ============================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================

-- Login or Register User (Upsert)
INSERT INTO users (telegram_id, username, first_name, last_name, photo_url)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (telegram_id) 
DO UPDATE SET 
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    photo_url = EXCLUDED.photo_url,
    updated_at = now()
RETURNING *;

-- Link/Update Wallet Address
UPDATE users
SET wallet_address = $1, updated_at = now()
WHERE telegram_id = $2
RETURNING user_id, telegram_id, wallet_address;

-- Get User by Telegram ID
SELECT user_id, telegram_id, username, first_name, last_name, photo_url, wallet_address, created_at
FROM users
WHERE telegram_id = $1;

-- ============================================================
-- CHALLENGES
-- ============================================================

-- Get All Active Challenges
SELECT challenge_id, title, description, image_url, reward_info, deadline, status, created_at
FROM challenges
WHERE status = 'active' AND deadline > now()
ORDER BY deadline ASC;

-- Get Challenge by ID
SELECT challenge_id, title, description, image_url, reward_info, deadline, status, created_at, updated_at
FROM challenges
WHERE challenge_id = $1;

-- Get Challenge with Submission Count
SELECT 
    c.challenge_id,
    c.title,
    c.description,
    c.image_url,
    c.reward_info,
    c.deadline,
    c.status,
    COUNT(s.submission_id) as total_submissions
FROM challenges c
LEFT JOIN submissions s ON c.challenge_id = s.challenge_id
WHERE c.challenge_id = $1
GROUP BY c.challenge_id;

-- Create Challenge (Admin)
INSERT INTO challenges (title, description, image_url, reward_info, deadline, status)
VALUES ($1, $2, $3, $4, $5, 'active')
RETURNING *;

-- Update Challenge Status (Admin)
UPDATE challenges
SET status = $1, updated_at = now()
WHERE challenge_id = $2
RETURNING *;

-- Mark Expired Challenges (Scheduled Job)
UPDATE challenges
SET status = 'expired', updated_at = now()
WHERE status = 'active' AND deadline < now()
RETURNING challenge_id, title;

-- ============================================================
-- SUBMISSIONS
-- ============================================================

-- Submit Photo (with user_id)
INSERT INTO submissions (user_id, challenge_id, image_url)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, challenge_id) DO NOTHING
RETURNING *;

-- Submit Photo (with telegram_id - requires join)
INSERT INTO submissions (user_id, challenge_id, image_url)
SELECT u.user_id, $2, $3
FROM users u
WHERE u.telegram_id = $1
ON CONFLICT (user_id, challenge_id) DO NOTHING
RETURNING *;

-- Check if User Already Submitted to Challenge
SELECT EXISTS(
    SELECT 1 
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
    WHERE u.telegram_id = $1 AND s.challenge_id = $2
) as already_submitted;

-- Get User's Submissions by Telegram ID
SELECT 
    s.submission_id,
    c.challenge_id,
    c.title as challenge_title,
    c.image_url as challenge_image,
    s.image_url as submission_image,
    s.created_at as submitted_at
FROM submissions s
JOIN challenges c ON s.challenge_id = c.challenge_id
JOIN users u ON s.user_id = u.user_id
WHERE u.telegram_id = $1
ORDER BY s.created_at DESC;

-- Get Submissions for a Challenge
SELECT 
    s.submission_id,
    u.user_id,
    u.username,
    u.first_name,
    u.photo_url as user_photo,
    s.image_url as submission_image,
    s.created_at as submitted_at
FROM submissions s
JOIN users u ON s.user_id = u.user_id
WHERE s.challenge_id = $1
ORDER BY s.created_at DESC;

-- ============================================================
-- ANALYTICS & LEADERBOARDS
-- ============================================================

-- User Leaderboard (Most Submissions)
SELECT 
    u.user_id,
    u.username,
    u.first_name,
    u.photo_url,
    u.wallet_address,
    COUNT(s.submission_id) as submission_count
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
GROUP BY u.user_id, u.username, u.first_name, u.photo_url, u.wallet_address
ORDER BY submission_count DESC, u.created_at ASC
LIMIT $1;

-- Challenge Popularity (Most Submissions)
SELECT 
    c.challenge_id,
    c.title,
    c.image_url,
    c.deadline,
    c.status,
    COUNT(s.submission_id) as submission_count
FROM challenges c
LEFT JOIN submissions s ON c.challenge_id = s.challenge_id
WHERE c.status = 'active'
GROUP BY c.challenge_id
ORDER BY submission_count DESC
LIMIT $1;

-- User Statistics
SELECT 
    u.user_id,
    u.telegram_id,
    u.username,
    u.first_name,
    u.wallet_address,
    u.created_at as joined_at,
    COUNT(s.submission_id) as total_submissions,
    COUNT(DISTINCT s.challenge_id) as challenges_completed,
    MAX(s.created_at) as last_submission_at
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
WHERE u.telegram_id = $1
GROUP BY u.user_id;

-- Daily Submission Stats
SELECT 
    DATE(created_at) as submission_date,
    COUNT(*) as submission_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT challenge_id) as unique_challenges
FROM submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY submission_date DESC;

-- ============================================================
-- COMBINED QUERIES FOR API ENDPOINTS
-- ============================================================

-- Home Screen Data (Active Challenges + User Progress)
WITH user_submissions AS (
    SELECT s.challenge_id
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
    WHERE u.telegram_id = $1
)
SELECT 
    c.challenge_id,
    c.title,
    c.description,
    c.image_url,
    c.reward_info,
    c.deadline,
    c.status,
    c.created_at,
    COUNT(s.submission_id) as total_submissions,
    EXISTS(SELECT 1 FROM user_submissions us WHERE us.challenge_id = c.challenge_id) as user_submitted
FROM challenges c
LEFT JOIN submissions s ON c.challenge_id = s.challenge_id
WHERE c.status = 'active' AND c.deadline > now()
GROUP BY c.challenge_id
ORDER BY 
    CASE WHEN EXISTS(SELECT 1 FROM user_submissions us WHERE us.challenge_id = c.challenge_id) 
         THEN 1 ELSE 0 END,
    c.deadline ASC;

-- Profile Data (User + Stats)
SELECT 
    u.user_id,
    u.telegram_id,
    u.username,
    u.first_name,
    u.last_name,
    u.photo_url,
    u.wallet_address,
    u.created_at as joined_at,
    COUNT(s.submission_id) as total_submissions,
    COUNT(DISTINCT s.challenge_id) as challenges_completed,
    COALESCE(MAX(s.created_at), u.created_at) as last_activity
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
WHERE u.telegram_id = $1
GROUP BY u.user_id;

-- ============================================================
-- DATABASE MAINTENANCE & MONITORING
-- ============================================================

-- Table Sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY bytes DESC;

-- Index Usage Stats
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Row Counts
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'challenges', COUNT(*) FROM challenges
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions;

-- Active Challenges Count
SELECT 
    status,
    COUNT(*) as count
FROM challenges
GROUP BY status;

-- Recent Activity (Last 24 hours)
SELECT 
    'New Users' as metric,
    COUNT(*) as count
FROM users
WHERE created_at >= now() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'New Submissions',
    COUNT(*)
FROM submissions
WHERE created_at >= now() - INTERVAL '24 hours';
