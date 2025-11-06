import React, { useState, useEffect } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';
import { Challenge, User, View, SubmissionWithChallengeDetails } from './types';
import { login, getActiveChallenges, createSubmission, getUserSubmissions, linkWallet } from './backend/api';
import Header from './components/Header';
import ChallengeCard from './components/ChallengeCard';
import ChallengeDetails from './components/ChallengeDetails';
import BottomNav from './components/BottomNav';
import ProfileView from './components/ProfileView';
import LoginScreen from './components/LoginScreen';

// Add this interface to define the structure of the Telegram WebApp object
interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  };
  ready: () => void;
  // Add other methods and properties as needed
}

// Add Telegram to the Window interface
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<SubmissionWithChallengeDetails[]>([]);
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const wallet = useTonWallet();
  
  // Fetch challenges after login
  useEffect(() => {
    if (currentUser && activeView === 'home') {
      setIsLoading(true);
      getActiveChallenges().then(setChallenges).catch(err => {
        console.error("Failed to fetch challenges:", err);
        alert(`Error: ${err.message}`);
      }).finally(() => setIsLoading(false));
    }
  }, [currentUser, activeView]);

  // Fetch submissions when profile is viewed
  useEffect(() => {
    if (currentUser && activeView === 'profile') {
        setIsLoading(true);
        getUserSubmissions(currentUser.telegram_id)
            .then(setUserSubmissions)
            .catch(err => {
              console.error("Failed to fetch submissions:", err);
              alert(`Error: ${err.message}`);
            })
            .finally(() => setIsLoading(false));
    }
  }, [currentUser, activeView]);

  // Effect to link wallet when it connects
  useEffect(() => {
    if (currentUser && wallet && wallet.account.address && currentUser.wallet_address !== wallet.account.address) {
      const walletAddress = wallet.account.address;
      // Prevent multiple requests if wallet is already linked in state
      if (currentUser.wallet_address === walletAddress) return;

      setIsLoading(true);
      linkWallet(currentUser.telegram_id, walletAddress)
        .then(() => {
          setCurrentUser(prev => prev ? {...prev, wallet_address: walletAddress} : null);
          alert("Wallet linked successfully!");
        })
        .catch(error => {
          console.error("Failed to link wallet:", error);
          alert(`Failed to link wallet: ${error.message}`);
        })
        .finally(() => setIsLoading(false));
    }
  }, [wallet, currentUser]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    
    const tg = window.Telegram?.WebApp;
    
    // For development in a regular browser or if user data is unavailable
    if (!tg?.initDataUnsafe?.user) {
        console.warn("Telegram user data not found. Using mock user for development.");
        const mockTelegramUser = {
            id: 123456789,
            username: "testuser",
            first_name: "Test",
            last_name: "User",
            photo_url: "https://picsum.photos/seed/user/200"
        };
        login(mockTelegramUser)
            .then(setCurrentUser)
            .catch(err => {
                console.error("Mock login failed:", err);
                alert(`Mock Login Failed: ${err.message}`);
            })
            .finally(() => setIsLoggingIn(false));
        return;
    }

    // For production in Telegram Mini App
    tg.ready();
    const telegramUser = tg.initDataUnsafe.user;

    login({
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        photo_url: telegramUser.photo_url,
    })
    .then(setCurrentUser)
    .catch(err => {
        console.error("Login failed:", err);
        alert(`Login Failed: ${err.message}`);
    })
    .finally(() => setIsLoggingIn(false));
  };
  
  const handleSelectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseDetails = () => {
    setSelectedChallenge(null);
  };

  const handleCreateSubmission = async (challengeId: number, image: File) => {
    if (!currentUser) return;
    
    // As per new spec, backend expects an image URL.
    // We will mock the image upload process and generate a placeholder URL.
    const mockImageUrl = `https://cdn.brandchallenge.com/uploads/mock_${Date.now()}_${image.name}`;
    console.log(`Submitting with mock URL: ${mockImageUrl}`);

    await createSubmission(currentUser.telegram_id, challengeId, mockImageUrl);

    // BountyDetails shows a success message. We close the modal after a short delay.
    setTimeout(() => {
        handleCloseDetails();
        // Optionally, refresh submissions if user is on profile page
        if (activeView === 'profile') {
          getUserSubmissions(currentUser.telegram_id).then(setUserSubmissions);
        }
    }, 2000);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-full pt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
    }

    switch(activeView) {
        case 'home':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-24">
                  {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} onSelect={() => handleSelectChallenge(challenge)} />
                  ))}
                </div>
            );
        case 'profile':
            return <ProfileView user={currentUser!} submissions={userSubmissions} />;
        default:
            return null;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans antialiased">
      <Header user={currentUser} />
      <main className="pt-16"> 
        {renderContent()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      {selectedChallenge && (
        <ChallengeDetails
          challenge={selectedChallenge} 
          onClose={handleCloseDetails} 
          onSubmit={handleCreateSubmission} 
        />
      )}
    </div>
  );
};

export default App;