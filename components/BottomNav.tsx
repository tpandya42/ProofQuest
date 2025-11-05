
import React from 'react';
import { View } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { UserIcon } from './icons/UserIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  isFeatured?: boolean;
}> = ({ label, icon, isActive, onClick, isFeatured }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full transition-colors duration-200 relative ${
      isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
    } ${isFeatured ? '-mt-6' : 'pt-2 pb-1'}`}
  >
    {isFeatured ? (
      <div className="bg-gray-900 rounded-full p-1">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
              {icon}
          </div>
      </div>
    ) : (
      <>
        {icon}
        <span className="text-xs font-medium mt-1">{label}</span>
        {isActive && <div className="absolute bottom-0 h-1 w-6 bg-blue-400 rounded-full"></div>}
      </>
    )}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 flex justify-around items-center z-20 h-16">
      <NavButton
        label="Bounties"
        icon={<HomeIcon className="w-6 h-6" />}
        isActive={activeView === 'home'}
        onClick={() => setActiveView('home')}
      />
      <NavButton
        label="Create"
        icon={<PlusCircleIcon className="w-8 h-8" />}
        isActive={activeView === 'create'}
        onClick={() => setActiveView('create')}
        isFeatured={true}
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
