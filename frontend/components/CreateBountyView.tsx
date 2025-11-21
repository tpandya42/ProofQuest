import React, { useState, useMemo } from 'react';
import { User, Bounty } from '../types';
import { TonIcon } from './icons/TonIcon';
import { XIcon } from './icons/XIcon';

interface CreateBountyViewProps {
    user: User;
    onCreateBounty: (bountyData: Omit<Bounty, 'id' | 'imageUrl'>, totalCost: number) => void;
    onClose: () => void;
}

const PLATFORM_FEE_PERCENT = 0.05; // 5%

const CreateBountyView: React.FC<CreateBountyViewProps> = ({ user, onCreateBounty, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [reward, setReward] = useState<number | ''>('');
    const [proofsNeeded, setProofsNeeded] = useState<number | ''>('');
    const [requirements, setRequirements] = useState<string[]>(['']);

    const handleRequirementChange = (index: number, value: string) => {
        const newRequirements = [...requirements];
        newRequirements[index] = value;
        setRequirements(newRequirements);
    };

    const addRequirement = () => {
        setRequirements([...requirements, '']);
    };

    const removeRequirement = (index: number) => {
        const newRequirements = requirements.filter((_, i) => i !== index);
        setRequirements(newRequirements);
    };

    const { subtotal, platformFee, totalCost } = useMemo(() => {
        const numReward = Number(reward) || 0;
        const numProofs = Number(proofsNeeded) || 0;
        const sub = numReward * numProofs;
        const fee = sub * PLATFORM_FEE_PERCENT;
        const total = sub + fee;
        return { subtotal: sub, platformFee: fee, totalCost: total };
    }, [reward, proofsNeeded]);

    // FIX: Safely access user.balance, providing a default value of 0.
    const canAfford = (user.balance || 0) >= totalCost;
    const isFormValid = title && description && Number(reward) > 0 && Number(proofsNeeded) > 0 && totalCost > 0;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !canAfford) return;

        const bountyData = {
            title,
            description,
            category,
            location,
            reward: Number(reward),
            requirements: requirements.filter(r => r.trim() !== ''),
        };
        onCreateBounty(bountyData, totalCost);
    };

    const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {label: string}> = ({label, ...props}) => (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                {...props} 
            />
        </div>
    );

    return (
        <div className="p-4 pb-24 animate-fade-in-up">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Bounty</h2>
                 <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput label="Bounty Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Verify new menu item" required />
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed instructions for participants..." required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-[100px]"></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Category" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Market Research" />
                    <FormInput label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Downtown" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Reward per Proof (TON)" type="number" value={reward} onChange={e => setReward(Number(e.target.value))} placeholder="e.g., 5" min="0.1" step="0.1" required />
                    <FormInput label="# of Proofs Needed" type="number" value={proofsNeeded} onChange={e => setProofsNeeded(Number(e.target.value))} placeholder="e.g., 10" min="1" step="1" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                    <div className="space-y-2">
                        {requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input 
                                    value={req}
                                    onChange={e => handleRequirementChange(index, e.target.value)}
                                    placeholder={`Requirement #${index + 1}`}
                                    className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                                <button type="button" onClick={() => removeRequirement(index)} disabled={requirements.length <= 1} className="p-2 text-gray-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addRequirement} className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-semibold">+ Add Requirement</button>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-gray-300"><p>Reward Pool:</p> <p>{subtotal.toFixed(2)} TON</p></div>
                    <div className="flex justify-between text-gray-400 text-sm"><p>Platform Fee ({PLATFORM_FEE_PERCENT*100}%):</p> <p>{platformFee.toFixed(2)} TON</p></div>
                    <hr className="border-gray-700"/>
                    <div className="flex justify-between text-white font-bold text-lg">
                        <p>Total Cost:</p> 
                        <div className="flex items-center text-blue-400">
                            <TonIcon className="w-5 h-5 mr-1.5"/>
                            <span>{totalCost.toFixed(2)} TON</span>
                        </div>
                    </div>
                     {/* FIX: Safely access user.balance, providing a default value of 0. */}
                     {!canAfford && totalCost > 0 && <p className="text-red-400 text-sm text-center pt-2">Insufficient balance. Your balance is {(user.balance || 0).toFixed(2)} TON.</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={!isFormValid || !canAfford}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  Fund & Create Bounty
                </button>
            </form>
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

export default CreateBountyView;
