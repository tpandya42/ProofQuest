import React from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';

interface HeaderProps {
  user: User;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onProfileClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg p-4 flex justify-between items-center z-20 border-b border-primary/20">
      <h1 className="text-xl font-bold text-white">ProofQuest</h1>
      <button
        onClick={onProfileClick}
        className="flex items-center bg-background-light hover:bg-primary/20 transition-colors text-light-blue rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
        aria-label="View profile"
      >
        <UserIcon className="w-5 h-5 mr-2 text-lavender" />
        <span className="font-semibold">{user.username || user.first_name}</span>
      </button>
    </header>
  );
};

export default Header;