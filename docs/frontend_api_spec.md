# 🧩 Frontend Integration Specification

**Project:** Brand Challenge Mini App
**Purpose:** Ensure API + data structure alignment between FastAPI backend and Telegram Mini App frontend.

---

## 🧱 1. Overview

### Frontend Stack:
- **Framework:** React (Vite or CRA)
- **Environment:** Telegram Mini App (runs inside Telegram client)
- **SDKs:**
    - Telegram WebApp JS SDK
    - @tonconnect/sdk
    - axios for API calls

### Backend:
- FastAPI + PostgreSQL
- REST endpoints with JSON responses
- Hosted on TigerData Cloud (HTTPS required for Telegram)

**Base URL Example:**
```
https://api.brandchallenge.tigerdata.cloud
```

---

## 🔐 2. Authentication Flow

**Mechanism:** Telegram Mini App Auth

### Frontend
- On load, access Telegram user data:
```javascript
const tg = window.Telegram.WebApp;
const user = tg.initDataUnsafe.user; 
```
- Send to backend for login/registration.

### API Call
**POST /users/login**

**Request:**
```json
{
  "telegram_id": 123456789,
  "username": "fran42",
  "first_name": "Francisco",
  "last_name": "Lopez",
  "photo_url": "https://t.me/i/userpic/320/fran.jpg"
}
```

**Response:**
```json
{
  "id": 1,
  "telegram_id": 123456789,
  "username": "fran42",
  "wallet_address": null,
  "created_at": "2025-11-05T12:30:00Z"
}
```

**Frontend Stores:**
`user_id`, `telegram_id`, and optionally `wallet_address` in local state.

---

## 💰 3. TON Connect Integration

### SDK Setup
```javascript
import { TonConnect } from "@tonconnect/sdk";
const connector = new TonConnect();
```

### Flow
- User taps `Connect Wallet`
- SDK opens wallet modal
- On success:
```javascript
connector.onStatusChange((walletInfo) => {
    const walletAddress = walletInfo?.account?.address;
    // POST to backend
});
```

### API Call
**POST /users/wallet**

**Request:**
```json
{
  "telegram_id": 123456789,
  "wallet_address": "EQDrf...abc"
}
```

**Response:**
```json
{
  "message": "Wallet linked successfully"
}
```

---

## 🏆 4. Challenges Module

### API Calls

#### Get All Active Challenges
**GET /challenges**

**Response:**
```json
[
  {
    "id": 1,
    "title": "Coca-Cola Shelf Hunt",
    "description": "Take a picture of the supermarket shelf where Coca-Cola bottles are displayed.",
    "image_url": "https://cdn.brandchallenge.com/coca.jpg",
    "reward_info": "Earn 10 points",
    "deadline": "2025-11-10T23:59:59Z",
    "status": "active"
  },
  {
    "id": 2,
    "title": "Pepsi Display Spot",
    "description": "Find a Pepsi shelf and capture it fully.",
    "image_url": "https://cdn.brandchallenge.com/pepsi.jpg",
    "reward_info": "Earn 15 points",
    "deadline": "2025-11-08T23:59:59Z",
    "status": "active"
  }
]
```

#### Get Challenge Details
**GET /challenges/{id}**

**Response:**
```json
{
  "id": 1,
  "title": "Coca-Cola Shelf Hunt",
  "description": "Take a picture of the supermarket shelf where Coca-Cola bottles are displayed.",
  "image_url": "https://cdn.brandchallenge.com/coca.jpg",
  "reward_info": "Earn 10 points",
  "deadline": "2025-11-10T23:59:59Z",
  "status": "active"
}
```

---

## 📸 5. Submissions Module

### Submit a Photo

**POST /submissions**

Multipart form-data (if backend handles upload):
`Content-Type: multipart/form-data`

**Form Fields:**

| Field        | Type | Example       |
|--------------|------|---------------|
| user_id      | int  | 1             |
| challenge_id | int  | 2             |
| image_file   | file | JPEG ≤ 5MB    |


**Response:**
```json
{
  "id": 10,
  "user_id": 1,
  "challenge_id": 2,
  "image_url": "https://cdn.brandchallenge.com/uploads/xyz123.jpg",
  "created_at": "2025-11-05T15:40:00Z"
}
```

🧠 If using pre-signed URLs, frontend must first call `/submissions/presign` (to get an upload URL) and then PUT the image directly to storage — backend returns `image_url` to use in `/submissions`.

---

### Get User Submissions

**GET /submissions/user/{telegram_id}**

**Response:**
```json
[
  {
    "id": 10,
    "challenge_id": 2,
    "challenge_title": "Pepsi Display Spot",
    "image_url": "https://cdn.brandchallenge.com/uploads/xyz123.jpg",
    "created_at": "2025-11-05T15:40:00Z"
  }
]
```
Frontend uses this to render “Completed Challenges.”

---

## 🧠 6. UI–Data Mapping Summary

| UI Component                | Data Source               | API Endpoint                      |
|-----------------------------|---------------------------|-----------------------------------|
| Home screen (Active Challenges) | Array of challenges       | `GET /challenges`                 |
| Challenge detail view       | Single challenge object   | `GET /challenges/{id}`            |
| Photo submission            | File + metadata           | `POST /submissions`               |
| Completed challenges tab    | Array of user submissions | `GET /submissions/user/{telegram_id}` |
| Profile                     | Telegram + wallet info    | `POST /users/login` + `/users/wallet` |

---

## ⚙️ 7. Expected HTTP Status Codes

| Code | Meaning        | Notes                             |
|------|----------------|-----------------------------------|
| 200  | OK             | Standard success                  |
| 201  | Created        | Successful submission             |
| 400  | Bad Request    | Missing field, invalid data       |
| 401  | Unauthorized   | Invalid Telegram data             |
| 404  | Not Found      | Challenge or submission missing   |
| 500  | Server Error   | Internal FastAPI error            |

---

## 🔧 8. Frontend Data Models (TypeScript Example)

```typescript
export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  wallet_address?: string | null;
  created_at: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  image_url: string;
  reward_info: string;
  deadline: string;
  status: "active" | "expired";
}

export interface Submission {
  id: number;
  user_id: number;
  challenge_id: number;
  image_url: string;
  created_at: string;
}
```

---

## 📋 9. Frontend Task Breakdown

| Task                      | Description                                                  |
|---------------------------|--------------------------------------------------------------|
| Setup Telegram WebApp SDK | Initialize Telegram environment, extract user info           |
| Integrate FastAPI Auth   | Send Telegram user data to `/users/login`                    |
| Challenge Feed            | Fetch and render cards from `/challenges`                    |
| Submit Photo              | File upload → `/submissions`                                 |
| Completed Tab             | Fetch from `/submissions/user/{telegram_id}`                 |
| TON Wallet Connect        | Implement mock integration, send address to `/users/wallet`  |
| UI Components             | Reusable components for challenge cards, modals, and buttons |
| Error Handling            | Display toast or Telegram alert on errors                    |

---

## 🧭 10. Notes for Developer
- Telegram Mini App must be served over HTTPS.
- On load, call `Telegram.WebApp.expand()` for full height.
- Use Telegram theme parameters (`tg.themeParams`) to style background dynamically.
- Image upload max: 5 MB JPEG, reject larger files on client side.
- Keep all API URLs in one config file (`src/config/api.ts`).
