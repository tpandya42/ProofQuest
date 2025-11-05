
import React, { useState, useEffect } from 'react';
import { Bounty, User, View } from './types';
import { MOCK_BOUNTIES, CURRENT_USER } from './constants';
import Header from './components/Header';
import BountyCard from './components/BountyCard';
import BountyDetails from './components/BountyDetails';
import BottomNav from './components/BottomNav';
import ProfileView from './components/ProfileView';
import ConnectWallet from './components/ConnectWallet';
import CreateBountyView from './components/CreateBountyView';

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [activeView, setActiveView] = useState<View>('home');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isConnected) {
      // Simulate fetching data only after connection
      setTimeout(() => {
        setBounties(MOCK_BOUNTIES);
        setIsLoading(false);
      }, 1500);
    }
  }, [isConnected]);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate TON Connect SDK process
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };
  
  const handleSelectBounty = (bounty: Bounty) => {
    setSelectedBounty(bounty);
  };

  const handleCloseDetails = () => {
    setSelectedBounty(null);
  };

  const handleSubmitProof = (bountyId: string, reward: number, image: File) => {
    console.log(`Submitting proof for bounty ${bountyId} with reward ${reward}`, image);
    
    // Update user state
    setCurrentUser(prevUser => ({
      ...prevUser,
      balance: prevUser.balance + reward,
      completedBounties: prevUser.completedBounties + 1,
      reputation: prevUser.reputation + 10, // Increase reputation
    }));

    // Remove bounty from list
    setBounties(prevBounties => prevBounties.filter(b => b.id !== bountyId));

    // Simulate network delay then close
    setTimeout(() => {
        handleCloseDetails();
    }, 2000);
  };

  const handleCreateBounty = (bountyData: Omit<Bounty, 'id' | 'imageUrl'>, totalCost: number) => {
    const newBounty: Bounty = {
        ...bountyData,
        id: new Date().getTime().toString(), // simple unique id
        imageUrl: `https://picsum.photos/seed/${Math.random()}/400/200` // random image
    };

    // Add new bounty to the list
    setBounties(prevBounties => [newBounty, ...prevBounties]);
    
    // Deduct cost from user balance
    setCurrentUser(prevUser => ({
        ...prevUser,
        balance: prevUser.balance - totalCost,
    }));
    
    // Switch back to home view
    setActiveView('home');
  };

  const renderContent = () => {
    switch(activeView) {
        case 'home':
            if (isLoading) {
                return (
                  <div className="flex justify-center items-center h-full pt-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                );
            }
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-24">
                  {bounties.map((bounty) => (
                    <BountyCard key={bounty.id} bounty={bounty} onSelect={() => handleSelectBounty(bounty)} />
                  ))}
                </div>
            );
        case 'profile':
            return <ProfileView user={currentUser} />;
        case 'create':
            return <CreateBountyView user={currentUser} onCreateBounty={handleCreateBounty} onClose={() => setActiveView('home')} />;
        default:
            return null;
    }
  };

  if (!isConnected) {
    return <ConnectWallet onConnect={handleConnect} isConnecting={isConnecting} />;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans antialiased">
      <Header user={currentUser} />
      <main className="pt-16"> 
        {renderContent()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      {selectedBounty && (
        <BountyDetails 
          bounty={selectedBounty} 
          onClose={handleCloseDetails} 
          onSubmit={handleSubmitProof} 
        />
      )}
    </div>
  );
};

export default App;
