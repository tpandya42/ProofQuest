import React, { useState, useEffect } from 'react';
import { Challenge, User, View, SubmissionWithChallengeDetails } from './types';
import { login, getActiveChallenges, createSubmission, getUserSubmissions, linkWallet } from './backend/api';
import Header from './components/Header';
import ChallengeCard from './components/ChallengeCard';
import ChallengeDetails from './components/ChallengeDetails';
import BottomNav from './components/BottomNav';
import ProfileView from './components/ProfileView';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<SubmissionWithChallengeDetails[]>([]);
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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

  const handleLogin = () => {
    setIsLoggingIn(true);
    // Simulate getting Telegram user data
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
            console.error("Login failed:", err);
            alert(`Login Failed: ${err.message}`);
        })
        .finally(() => setIsLoggingIn(false));
  };

  const handleLinkWallet = async () => {
    if(!currentUser) return;
    // Simulate TON Connect SDK process
    alert("Wallet connect modal would open here.");
    const mockWalletAddress = `EQ${Date.now().toString(36)}...xyz`;
    try {
        await linkWallet(currentUser.telegram_id, mockWalletAddress);
        // Update user state locally
        setCurrentUser(prev => prev ? {...prev, wallet_address: mockWalletAddress} : null);
        alert("Wallet linked successfully!");
    } catch (error) {
        console.error(error);
        alert("Failed to link wallet.");
    }
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
            return <ProfileView user={currentUser!} submissions={userSubmissions} onLinkWallet={handleLinkWallet} />;
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