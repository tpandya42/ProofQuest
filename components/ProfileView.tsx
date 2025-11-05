
import React from 'react';
import { User } from '../types';
import { TonIcon } from './icons/TonIcon';

interface ProfileViewProps {
  user: User;
}

const StatCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
        {icon && <div className="mb-2">{icon}</div>}
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-gray-400">{label}</span>
    </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div className="p-4 animate-fade-in-up pb-24">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 ring-4 ring-gray-700">
            <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
        </div>
        <h2 className="text-3xl font-bold text-white">{user.name}</h2>
        <p className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full mt-2 truncate max-w-xs">{user.walletAddress}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="Level" value={user.level} />
        <StatCard label="Bounties Completed" value={user.completedBounties} />
      </div>

       <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Balance</h3>
        <div className="flex items-center justify-center text-4xl font-bold text-blue-400">
            <TonIcon className="w-9 h-9 mr-2" />
            <span>{user.balance.toFixed(2)}</span>
        </div>
      </div>
      <style>{`
          @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProfileView;
