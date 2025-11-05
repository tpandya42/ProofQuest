
export interface Bounty {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  reward: number; // in TON
  category: string;
  location: string;
  imageUrl: string; 
}

export interface User {
  name: string;
  walletAddress: string;
  balance: number; // in TON
  level: number;
  completedBounties: number;
}

export type View = 'home' | 'profile';
