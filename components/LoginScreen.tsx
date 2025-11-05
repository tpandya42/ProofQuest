
import React from 'react';
import { TonIcon } from './icons/TonIcon';
import { TelegramIcon } from './icons/TelegramIcon';

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 mb-6">
        <TonIcon />
      </div>
      <h1 className="text-4xl font-bold mb-2">Welcome to Brand Challenge</h1>
      <p className="text-gray-400 max-w-sm mb-8">
        Connect with your Telegram account to start completing challenges and earning rewards.
      </p>
      
      <button
        onClick={onLogin}
        disabled={isLoggingIn}
        className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-wait text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
      >
        {isLoggingIn ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <TelegramIcon className="w-6 h-6 mr-3" />
            <span>Connect with Telegram</span>
          </>
        )}
      </button>
    </div>
  );
};

export default LoginScreen;
