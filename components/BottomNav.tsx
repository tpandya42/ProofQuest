
import React from 'react';
import { View } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { UserIcon } from './icons/UserIcon';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-around items-center z-20 h-16">
      <NavButton
        label="Bounties"
        icon={<HomeIcon className="w-6 h-6 mb-1" />}
        isActive={activeView === 'home'}
        onClick={() => setActiveView('home')}
      />
      <NavButton
        label="Profile"
        icon={<UserIcon className="w-6 h-6 mb-1" />}
        isActive={activeView === 'profile'}
        onClick={() => setActiveView('profile')}
      />
    </nav>
  );
};

export default BottomNav;
