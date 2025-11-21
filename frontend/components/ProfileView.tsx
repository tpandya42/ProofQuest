import React from 'react';
import { User, SubmissionWithChallengeDetails } from '../types';
import { TonIcon } from './icons/TonIcon';
import { TonConnectButton } from '@tonconnect/ui-react';
import { CameraIcon } from './icons/CameraIcon';

interface ProfileViewProps {
  user: User;
  submissions: SubmissionWithChallengeDetails[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, submissions }) => {
  return (
    <div className="p-4 animate-fade-in-up pb-24">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-lavender flex items-center justify-center mb-4 ring-4 ring-primary/30 overflow-hidden">
          {user.photo_url ? (
            <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold">{user.first_name?.charAt(0) || 'U'}</span>
          )}
        </div>
        <h2 className="text-3xl font-bold text-white">{user.first_name} {user.last_name}</h2>
        <p className="text-sm text-light-blue">@{user.username}</p>
      </div>
      
      <div className="bg-background-light p-4 rounded-lg mb-8">
        <h3 className="text-md font-semibold text-light-blue/80 mb-2">Wallet Address</h3>
        {user.wallet_address ? (
          <p className="text-sm text-mint bg-background px-3 py-2 rounded-lg truncate">{user.wallet_address}</p>
        ) : (
          <div className="text-center">
            <p className="text-light-blue mb-3 text-sm">Your wallet is not connected.</p>
            <div className="flex justify-center">
                <TonConnectButton />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Completed Challenges ({submissions.length})</h3>
        {submissions.length > 0 ? (
          <ul className="space-y-3">
            {submissions.map(sub => {
              const imageSrc = (sub.image_data && sub.image_mime_type)
                ? `data:${sub.image_mime_type};base64,${sub.image_data}`
                : null;
              return (
                <li key={sub.id} className="bg-background-light p-4 rounded-lg flex items-center gap-4">
                  {imageSrc ? (
                    <img src={imageSrc} alt={sub.challenge_title} className="w-16 h-16 rounded-md object-cover bg-background" />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-background flex items-center justify-center text-light-blue/50">
                      <CameraIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-white truncate">{sub.challenge_title}</p>
                    <p className="text-sm text-light-blue">Submitted: {new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-background-light p-6 rounded-lg text-center text-light-blue">
            <p>You haven't completed any challenges yet.</p>
          </div>
        )}
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