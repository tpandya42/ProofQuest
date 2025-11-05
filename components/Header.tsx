
import React from 'react';
import { User } from '../types';
import { UserIcon } from './icons/UserIcon';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg p-4 flex justify-between items-center z-20 border-b border-gray-700/50">
      <h1 className="text-xl font-bold text-white">Brand Challenge</h1>
      <div className="flex items-center bg-gray-800 text-gray-300 rounded-full px-3 py-1.5 text-sm">
        <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
        <span className="font-semibold">{user.username || user.first_name}</span>
      </div>
    </header>
  );
};

export default Header;
