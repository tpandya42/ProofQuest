import React from 'react';
import { Challenge } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  onSelect: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-background-light rounded-lg overflow-hidden shadow-lg hover:shadow-primary/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:ring-2 hover:ring-primary"
    >
      <img className="w-full h-32 object-cover" src={challenge.image_url} alt={challenge.title} />
      <div className="p-4">
        <h3 className="font-bold text-lg text-white mb-2 truncate">{challenge.title}</h3>
        <p className="text-light-blue text-sm mb-4 h-10 overflow-hidden text-ellipsis">{challenge.description}</p>
        <div className="flex justify-end items-center">
          <span className="text-md font-bold text-mint px-3 py-1 bg-mint/10 rounded-full">
            {challenge.reward_info}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;