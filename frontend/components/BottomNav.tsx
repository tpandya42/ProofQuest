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
    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 relative pt-2 pb-1 ${
      isActive ? 'text-mint' : 'text-light-blue/70 hover:text-mint'
    }`}
  >
    {icon}
    <span className="text-xs font-medium mt-1">{label}</span>
    {isActive && <div className="absolute bottom-0 h-1 w-6 bg-mint rounded-full"></div>}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-primary/20 flex justify-around items-center z-20 h-16">
      <NavButton
        label="Challenges"
        icon={<HomeIcon className="w-6 h-6" />}
        isActive={activeView === 'home'}
        onClick={() => setActiveView('home')}
      />
      <NavButton
        label="Profile"
        icon={<UserIcon className="w-6 h-6" />}
        isActive={activeView === 'profile'}
        onClick={() => setActiveView('profile')}
      />
    </nav>
  );
};

export default BottomNav;