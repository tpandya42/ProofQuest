import React, { useState, useEffect } from 'react';
import { Challenge, User, View, SubmissionWithChallengeDetails } from './types';
import { login, getActiveChallenges, createSubmission, getUserSubmissions, linkWallet } from './backend/api';
import Header from './components/Header';
import ChallengeCard from './components/ChallengeCard';
import ChallengeDetails from './components/ChallengeDetails';
import BottomNav from './components/BottomNav';
import ProfileView from './components/ProfileView';
import LoginScreen from './components/LoginScreen';
import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react';

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

// This component will handle wallet address synchronization
const WalletManager: React.FC<{
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}> = ({ currentUser, setCurrentUser }) => {
  const userFriendlyAddress = useTonAddress();

  useEffect(() => {
    // Check if there is a logged in user, a connected address, and if it's different from the stored one.
    if (currentUser && userFriendlyAddress && userFriendlyAddress !== currentUser.wallet_address) {
      console.log(`Linking new wallet address: ${userFriendlyAddress}`);
      linkWallet(currentUser.telegram_id, userFriendlyAddress)
        .then(() => {
          // Update the user state locally for immediate UI feedback
          setCurrentUser(prev => prev ? { ...prev, wallet_address: userFriendlyAddress } : null);
          console.log("Wallet linked successfully in backend.");
        })
        .catch(error => {
          console.error("Failed to link wallet in backend:", error);
          alert("Failed to link wallet. Please try again.");
        });
    }
  }, [userFriendlyAddress, currentUser, setCurrentUser]);

  // This is a non-visual component
  return null;
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<SubmissionWithChallengeDetails[]>([]);
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeView, setActiveView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Construct an absolute URL for the manifest.
  // This is the recommended approach to ensure wallets can always find it.
  const manifestUrl = new URL('tonconnect-manifest.json', window.location.origin).toString();
  
  // Fetch challenges after login
  useEffect(() => {
    if (currentUser && activeView === 'home') {
      setIsLoading(true);
      getActiveChallenges().then(fetchedChallenges => {
        // Sort challenges by ID in descending order to show newest first.
        const sortedChallenges = fetchedChallenges.sort((a, b) => b.id - a.id);
        setChallenges(sortedChallenges);
      }).catch(err => {
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
            .then(backendUser => {
                // Merge backend data with mock telegram data to ensure photo_url etc. are present
                setCurrentUser({ ...mockTelegramUser, ...backendUser });
            })
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

    const tgUserPayload = {
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        photo_url: telegramUser.photo_url,
    };

    login(tgUserPayload)
    .then(backendUser => {
        // Merge backend data with telegram data to ensure all user fields are populated
        setCurrentUser({ ...tgUserPayload, ...backendUser });
    })
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

  const handleCreateSubmission = async (challengeId: number, image: File): Promise<string | void> => {
    if (!currentUser) return "User not found. Please log in again.";
    
    // Convert image file to Base64 to send to backend
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
            const result = reader.result as string;
            // The result is a data URL like "data:image/jpeg;base64,LzlqLzRBQ...".
            // We need to strip the prefix to get just the base64 data.
            const base64Data = result.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(image);
    });

    try {
        const imageData = await base64Promise;
        const imageMimeType = image.type;

        await createSubmission(currentUser.telegram_id, challengeId, imageData, imageMimeType);

        // Success message is shown in ChallengeDetails. We close the modal after a short delay.
        setTimeout(() => {
            handleCloseDetails();
            // Optionally, refresh submissions if user is on profile page
            if (activeView === 'profile') {
              getUserSubmissions(currentUser.telegram_id).then(setUserSubmissions);
            }
        }, 2000);
    } catch (error: any) {
        console.error("Failed to create submission:", error);
        // Return the error message to be displayed in the UI
        return error.message || "An unknown error occurred during submission.";
    }
  };

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-full pt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
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

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} isLoggingIn={isLoggingIn} />
      ) : (
        <div className="bg-background min-h-screen text-white font-sans antialiased">
          <Header user={currentUser} onProfileClick={() => setActiveView('profile')} />
          <WalletManager currentUser={currentUser} setCurrentUser={setCurrentUser} />
          <main className="pt-16">
            {renderContent()}
          </main>
          <BottomNav activeView={activeView} setActiveView={setActiveView} />
          {selectedChallenge && (
            <ChallengeDetails
              challenge={selectedChallenge}
              currentUser={currentUser}
              onClose={handleCloseDetails}
              onSubmit={handleCreateSubmission}
            />
          )}
        </div>
      )}
    </TonConnectUIProvider>
  );
};

export default App;