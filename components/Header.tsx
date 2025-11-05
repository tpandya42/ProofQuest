
import React from 'react';
import { User } from '../types';
import { TonIcon } from './icons/TonIcon';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg p-4 flex justify-between items-center z-20 border-b border-gray-700/50">
      <h1 className="text-xl font-bold text-white">ProofQuest</h1>
      <div className="flex items-center bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 rounded-full px-3 py-1.5 ring-1 ring-inset ring-blue-500/50">
        <TonIcon className="w-5 h-5 mr-2" />
        <span className="font-semibold">{user.balance.toFixed(2)} TON</span>
      </div>
    </header>
  );
};

export default Header;
