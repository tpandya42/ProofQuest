import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Challenge, User } from '../types';
import { logVerificationAttempt, VerificationLogPayload } from '../backend/api';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ChallengeDetailsProps {
  challenge: Challenge;
  currentUser: User;
  onClose: () => void;
  onSubmit: (challengeId: number, image: File) => Promise<string | void>;
}

// Helper function to convert File to GenerativePart for Gemini API
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

// Helper function to convert File to a clean Base64 string for logging
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};


const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({ challenge, currentUser, onClose, onSubmit }) => {
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
    
    const startTime = Date.now();
    const prompt = `Analyze the provided image to see if it is related to this request: "${challenge.description}". Focus on the main subject. Is it a plausible submission? Respond with only "Yes" or "No", followed by a brief, one-sentence explanation.`;
    const imageDataBase64 = await fileToBase64(imageFile);

    const logPayload: VerificationLogPayload = {
        user_telegram_id: currentUser.telegram_id,
        challenge_id: challenge.id,
        image_data: imageDataBase64,
        image_mime_type: imageFile.type,
        ai_model_used: 'gemini-2.5-flash',
        ai_prompt: prompt,
        verification_result: 'API_ERROR', // Default status
        api_call_duration_ms: 0,
    };

    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 1000;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            if (!process.env.API_KEY) {
                throw new Error("API key is missing.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const imagePart = {
                inlineData: { data: imageDataBase64, mimeType: imageFile.type },
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
            });
            
            const text = response.text;
            setAiResponse(text);
            logPayload.ai_raw_response = text;

            if (text.toLowerCase().startsWith('yes')) {
                setIsVerified(true);
                logPayload.verification_result = 'APPROVED';
            } else {
                logPayload.verification_result = 'REJECTED';
            }

            lastError = null; // Clear error on success
            break; // Exit the loop if the API call was successful

        } catch (e: any) {
            lastError = e;
            console.warn(`AI verification attempt ${attempt}/${MAX_ATTEMPTS} failed:`, e);
            logPayload.error_message = e.message;
            
            if (attempt < MAX_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
    }

    if (lastError) {
        console.error("All AI verification attempts failed.", lastError);
        setError("AI verification failed. Please try again.");
    }

    setIsVerifying(false);
    logPayload.api_call_duration_ms = Date.now() - startTime;
    await logVerificationAttempt(logPayload);
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!imageFile || !isVerified) return;
    
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    try {
      const submissionError = await onSubmit(challenge.id, imageFile);
      
      if (submissionError) {
        setError(submissionError); // Display the specific error from the backend
      } else {
        setIsSubmitted(true); // Proceed to success state
      }
    } catch (e: any) {
        // This is a fallback, but the promise should not reject based on the change in App.tsx
        console.error("An unexpected error occurred in the submit handler:", e);
        setError(e.message || "An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  }, [challenge.id, imageFile, isVerified, onSubmit]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-background-light rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <header className="p-4 flex justify-between items-center border-b border-primary/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate">{challenge.title}</h2>
          <button onClick={onClose} className="text-light-blue hover:text-white transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="flex justify-end items-center mb-4">
              <div className="text-lg font-bold text-mint px-3 py-1.5 bg-mint/10 rounded-full">
                  <span>{challenge.reward_info}</span>
              </div>
          </div>

          <p className="text-light-blue mb-6">{challenge.description}</p>
          
          <div className="text-sm text-light-blue mb-6">
            <p><strong>Status:</strong> <span className={`capitalize ${challenge.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{challenge.status}</span></p>
            <p><strong>Deadline:</strong> {new Date(challenge.deadline).toLocaleString()}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {isSubmitted ? (
              <div className="text-center p-8 bg-background rounded-lg flex flex-col items-center">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4"/>
                  <h3 className="text-2xl font-bold text-white mb-2">Submission Successful!</h3>
                  <p className="text-light-blue">Your proof has been submitted.</p>
              </div>
            ) : (
                <>
                <label htmlFor="file-upload" className="w-full cursor-pointer bg-background hover:bg-background/70 border-2 border-dashed border-primary/50 rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors">
                    {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Preview" className="max-h-40 rounded-md object-contain" />
                    ) : (
                        <>
                        <CameraIcon className="w-10 h-10 text-light-blue mb-2" />
                        <span className="font-semibold text-white">Capture Proof</span>
                        <span className="text-sm text-light-blue">Tap to open camera</span>
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
                            className="w-full bg-lavender hover:bg-opacity-90 disabled:bg-primary/20 disabled:text-light-blue/50 disabled:cursor-not-allowed text-background font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 mb-2"
                        >
                            {isVerifying ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background"></div>
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
                         {error && !isVerifying && (
                            <div className="text-sm p-3 rounded-md bg-red-500/20 text-red-300 mt-2">
                                <p><span className="font-bold">Error:</span> {error}</p>
                            </div>
                        )}
                    </div>
                )}

                <button 
                  type="submit" 
                  disabled={!isVerified || isSubmitting}
                  className="mt-4 w-full bg-primary hover:opacity-90 disabled:bg-primary/20 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200"
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