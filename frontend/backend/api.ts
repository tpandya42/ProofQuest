import { Challenge, Submission, User, SubmissionWithChallengeDetails } from '../types';

// Use the production backend URL provided in the documentation.
const BASE_URL = 'https://your-app.onrender.com';

// --- TYPES ---

export interface VerificationLogPayload {
    user_telegram_id: number;
    challenge_id: number;
    image_data: string;
    image_mime_type: string;
    ai_model_used: string;
    ai_prompt: string;
    ai_raw_response?: string;
    verification_result: 'APPROVED' | 'REJECTED' | 'API_ERROR';
    error_message?: string;
    api_call_duration_ms: number;
}


// --- API FUNCTIONS ---

// Helper for handling API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};


// POST /users/login
export const login = async (telegramUser: {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}): Promise<User> => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
    }),
  });
  return handleResponse(response);
};

// POST /users/wallet
export const linkWallet = async (telegram_id: number, wallet_address: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/users/wallet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegram_id, wallet_address }),
    });
    return handleResponse(response);
};


// GET /challenges
export const getActiveChallenges = async (): Promise<Challenge[]> => {
  const response = await fetch(`${BASE_URL}/challenges`);
  return handleResponse(response);
};

// POST /submissions
export const createSubmission = async (telegramId: number, challengeId: number, imageData: string, imageMimeType: string): Promise<Submission> => {
    const response = await fetch(`${BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            telegram_id: telegramId,
            challenge_id: challengeId,
            image_data: imageData,
            image_mime_type: imageMimeType,
        }),
    });
    return handleResponse(response);
};

// GET /submissions/user/{telegram_id}
export const getUserSubmissions = async (telegramId: number): Promise<SubmissionWithChallengeDetails[]> => {
    const response = await fetch(`${BASE_URL}/submissions/user/${telegramId}`);
    return handleResponse(response);
};

// POST /verification-logs
export const logVerificationAttempt = async (payload: VerificationLogPayload): Promise<void> => {
    try {
        const response = await fetch(`${BASE_URL}/verification-logs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Failed to log AI verification attempt:', errorData);
        }
    } catch (error) {
        console.warn('Network error while logging AI verification:', error);
    }
};