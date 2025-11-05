
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Challenge } from '../types';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChallengeDetailsProps {
  challenge: Challenge;
  onClose: () => void;
  onSubmit: (challengeId: number, image: File) => Promise<void>;
}

// Helper function to convert File to GenerativePart
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({ challenge, onClose, onSubmit }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      // Reset AI verification state
      setIsVerified(false);
      setAiResponse(null);
      setError(null);
    }
  };
  
  const handleAIVerify = async () => {
    if (!imageFile) return;

    setIsVerifying(true);
    setAiResponse(null);
    setIsVerified(false);
    setError(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is missing.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const imagePart = await fileToGenerativePart(imageFile);
      const prompt = `Analyze the provided image to see if it fulfills the core task of this request: "${challenge.description}". Focus on the main subject. Is it a plausible submission? Respond with only "Yes" or "No", followed by a brief, one-sentence explanation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
      });
      
      const text = response.text;
      setAiResponse(text);
      if (text.toLowerCase().startsWith('yes')) {
        setIsVerified(true);
      }
    } catch (e) {
      console.error(e);
      setError("AI verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile || !isVerified) return;
    setIsSubmitting(true);
    await onSubmit(challenge.id, imageFile);
    setIsSubmitted(true);
    setIsSubmitting(false);
  }, [challenge.id, imageFile, isVerified, onSubmit]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate">{challenge.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="flex justify-end items-center mb-4">
              <div className="text-lg font-bold text-blue-400 px-3 py-1.5 bg-blue-500/20 rounded-full">
                  <span>{challenge.reward_info}</span>
              </div>
          </div>

          <p className="text-gray-300 mb-6">{challenge.description}</p>
          
          <div className="text-sm text-gray-400 mb-6">
            <p><strong>Status:</strong> <span className={`capitalize ${challenge.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{challenge.status}</span></p>
            <p><strong>Deadline:</strong> {new Date(challenge.deadline).toLocaleString()}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {isSubmitted ? (
              <div className="text-center p-8 bg-gray-900 rounded-lg flex flex-col items-center">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4"/>
                  <h3 className="text-2xl font-bold text-white mb-2">Submission Successful!</h3>
                  <p className="text-gray-400">Your proof has been submitted.</p>
              </div>
            ) : (
                <>
                <label htmlFor="file-upload" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 border-2 border-dashed border-gray-500 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors">
                    {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Preview" className="max-h-40 rounded-md object-contain" />
                    ) : (
                        <>
                        <CameraIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="font-semibold text-white">Capture Proof</span>
                        <span className="text-sm text-gray-400">Tap to open camera</span>
                        </>
                    )}
                </label>
                <input id="file-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              
                {imageFile && (
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={handleAIVerify}
                            disabled={isVerifying || isVerified}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 mb-2"
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : isVerified ? (
                                <>
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                <span>Verified by AI</span>
                                </>
                            ) : (
                                <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                <span>Verify with AI</span>
                                </>
                            )}
                        </button>
                        {aiResponse && (
                             <div className={`text-sm p-3 rounded-md ${isVerified ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                <p><span className="font-bold">AI Feedback:</span> {aiResponse}</p>
                            </div>
                        )}
                         {error && (
                            <div className="text-sm p-3 rounded-md bg-red-500/20 text-red-300">
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                )}

                <button 
                  type="submit" 
                  disabled={!isVerified || isSubmitting}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                      <>
                      <UploadIcon className="w-5 h-5 mr-2" />
                      <span>Submit Proof</span>
                      </>
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
       <style>{`
          @keyframes fade-in {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ChallengeDetails;
