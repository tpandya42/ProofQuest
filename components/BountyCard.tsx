
import React from 'react';
import { Bounty } from '../types';
import { TonIcon } from './icons/TonIcon';
import { LocationIcon } from './icons/LocationIcon';

interface BountyCardProps {
  bounty: Bounty;
  onSelect: () => void;
}

const BountyCard: React.FC<BountyCardProps> = ({ bounty, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:ring-2 hover:ring-blue-500"
    >
      <img className="w-full h-32 object-cover" src={bounty.imageUrl} alt={bounty.title} />
      <div className="p-4">
        <h3 className="font-bold text-lg text-white mb-2 truncate">{bounty.title}</h3>
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <LocationIcon className="w-4 h-4 mr-2" />
          <span>{bounty.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{bounty.category}</span>
          <div className="flex items-center text-lg font-bold text-blue-400">
            <TonIcon className="w-5 h-5 mr-1" />
            <span>{bounty.reward}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BountyCard;
