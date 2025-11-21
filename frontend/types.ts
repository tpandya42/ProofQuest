export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  wallet_address?: string | null;
  created_at: string;
  // FIX: Added optional balance property to the User interface to resolve type errors.
  balance?: number;
}

// FIX: Added the missing Bounty interface definition.
export interface Bounty {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  reward: number;
  category: string;
  location: string;
  imageUrl: string;
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

export interface SubmissionWithChallengeDetails {
    id: number;
    challenge_id: number;
    challenge_title: string;
    image_url: string;
    image_data?: string | null;
    image_mime_type?: string | null;
    created_at: string;
}

export type View = 'home' | 'profile';