import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Volume2, AlertCircle, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { speakText } from '../lib/elevenlabs';

// Get ElevenLabs Agent ID from environment variables
const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

interface ElevenLabsVoiceAgentProps {
  onReminderCreated?: () => void;
}

export default function ElevenLabsVoiceAgent({ onReminderCreated }: ElevenLabsVoiceAgentProps) {
  const { user } = useAuth();
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    // Check for media devices support on component mount
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsVoiceSupported(true);
    }
    
    // Check if ElevenLabs is properly configured
    if (!ELEVENLABS_AGENT_ID) {
      setConfigError('ElevenLabs Agent ID is missing. Please add VITE_ELEVENLABS_AGENT_ID to your .env file.');
      setIsConfigured(false);
    } else {
      setIsConfigured(true);
    }
  }, []);

  const categorizeReminder = (title: string): string => {
    const text = title.toLowerCase();
    
    if (text.includes('medicine') || text.includes('pill') || text.includes('medication') || text.includes('gamot')) {
      return 'Medicine';
    }
    
    if (text.includes('bill') || text.includes('payment') || text.includes('bayad')) {
      return 'Bills';
    }
    
    if (text.includes('birthday') || text.includes('anniversary') || text.includes('kaarawan')) {
      return 'Birthday';
    }
    
    if (text.includes('appointment') || text.includes('meeting') || text.includes('doctor') || text.includes('checkup')) {
      return 'Appointments';
    }
    
    return 'Others';
  };

  const formatTimeString = (timeInput: string): string | null => {
    if (!timeInput) return null;
    
    // Enhanced time formatting - convert various formats to ISO timestamp
    const timePatterns = [
      /(\d{1,2})\s*(am|pm)/i,                    // "7am", "11 PM"
      /(\d{1,2}):(\d{2})\s*(am|pm)?/i,          // "7:30am", "11:45 PM", "14:30"
      /(\d{1,2})\s*o'?clock\s*(am|pm)?/i,       // "7 o'clock", "7 oclock am"
      /(\d{1,2})\.(\d{2})\s*(am|pm)?/i,         // "7.30am", "11.45 PM"
    ];

    for (const pattern of timePatterns) {
      const match = timeInput.match(pattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] && !isNaN(parseInt(match[2])) ? parseInt(match[2]) : 0;
        const period = match[3] || (match[2] && isNaN(parseInt(match[2])) ? match[2] : null);

        // Handle 24-hour format
        if (!period && hour > 12) {
          // Already in 24-hour format, use as is
        } else if (period && period.toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (period && period.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }

        // If no AM/PM specified and hour is ambiguous, assume PM for hours 1-6, AM for 7-11
        if (!period && hour >= 1 && hour <= 6) {
          hour += 12;
        }

        // Create timestamp for today at the specified time
        const today = new Date();
        today.setHours(hour, minute, 0, 0);
        
        // If the time has already passed today, set it for tomorrow
        if (period && period.toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (period && period.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }

        return today.toISOString();
      }
    }

    return null;
  };

  const conversation = useConversation({
    agentId: ELEVENLABS_AGENT_ID,
    clientTools: {
      create_reminder: async (params: { title: string; category?: string; time?: string }) => {
        if (!user) {
          return 'I need you to be logged in to create reminders.';
        }

        try {
          const reminderTitle = params.title || 'Untitled Reminder';
          const reminderCategory = params.category || categorizeReminder(reminderTitle);
          const reminderTime = params.time ? formatTimeString(params.time) : null;

          console.log('Creating reminder:', {
            title: reminderTitle,
            category: reminderCategory,
            time: reminderTime,
            originalTime: params.time
          });

          // Save reminder to Supabase
          const { data, error } = await supabase.from('reminders').insert({
            user_id: user.id,
            type: reminderCategory,
            title: reminderTitle,
            reminder_time: reminderTime,
          }).select();

          if (error) {
            console.error('Supabase insert error:', error);
            throw error;
          }

          console.log('Reminder created successfully:', data);

          const response = `Perfect! I've created a reminder for "${reminderTitle}"${
            reminderTime ? ` at ${params.time}` : ''
          }. It's been saved to your ${reminderCategory.toLowerCase()} reminders.`;
          
          setFeedback(response);
          
          // Trigger callback if provided
          if (onReminderCreated) {
            onReminderCreated();
          }

          return response;
        } catch (error) {
          console.error('Error creating reminder:', error);
          const errorMessage = `Sorry, I couldn't save that reminder. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
          setFeedback(errorMessage);
          return errorMessage;
        }
      },
    },
    onMessage: (message) => {
      console.log('Agent message:', message);
      setLastMessage(message.message || '');
      setFeedback(''); // Clear any previous error feedback
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      let errorMessage = 'Sorry, there was an error with the voice assistant.';
      
      // Check for specific error types
      if (error.message && error.message.includes('does not exist')) {
        errorMessage = 'The AI agent configuration is invalid. Please check your VITE_ELEVENLABS_AGENT_ID in the .env file.';
      } else if (error.message && error.message.includes('unauthorized')) {
        errorMessage = 'Invalid ElevenLabs credentials. Please check your API key and agent ID.';
      } else if (error.message && error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setFeedback(errorMessage);
      speakText(errorMessage);
    },
  });

  const handleToggleConversation = async () => {
    if (!isConfigured) {
      setFeedback(errorMessage);
      speakText(errorMessage);
      return;
    }

    if (conversation.status === 'connected') {
      await conversation.endSession();
      setFeedback('');
      setLastMessage('');
    } else {
      try {
        // Request microphone permissions before starting
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({ agentId: ELEVENLABS_AGENT_ID });
        setFeedback('');
      } catch (error) {
        console.error('Microphone access denied.', error);
        let errorMessage = '';
        
        if (error instanceof Error && error.name === 'NotAllowedError') {
          errorMessage = 'Microphone access was denied. Please click the microphone icon in your browser\'s address bar and allow microphone access, then try again.';
        } else if (error instanceof Error && error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else {
          errorMessage = 'Unable to access microphone. Please check your browser settings and try again.';
        }
        
        setFeedback(errorMessage);
        speakText(errorMessage);
      }
    }
  };

  const getStatusLabel = () => {
    if (conversation.status === 'connecting') return 'Connecting...';
    if (conversation.isSpeaking) return 'Speaking...';
    if (conversation.status === 'connected') return 'Listening...';
    return 'Tap to talk to your AI assistant';
  };

  const getButtonState = () => {
    if (conversation.status === 'connecting') return 'connecting';
    if (conversation.isSpeaking) return 'speaking';
    if (conversation.status === 'connected') return 'listening';
    return 'idle';
  };

  // Show configuration error if ElevenLabs is not set up
  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-accent-red mx-auto mb-6" />
          <h3 className="text-xl font-bold text-primary-text dark:text-dark-primary-text mb-4">
            Voice Assistant Setup Required
          </h3>
          <div className="bg-accent-red/20 border-2 border-accent-red p-6 rounded-xl max-w-lg">
            <p className="text-accent-red font-semibold text-lg mb-4">{configError}</p>
            <div className="text-left text-sm text-secondary-text dark:text-dark-secondary-text space-y-2">
              <p className="font-semibold">To set up the voice assistant:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create an account at <a href="https://elevenlabs.io" className="text-accent-blue underline" target="_blank" rel="noopener noreferrer">elevenlabs.io</a></li>
                <li>Get your API key from the ElevenLabs dashboard</li>
                <li>Create an AI agent and copy its ID</li>
                <li>Create a <code className="bg-tertiary-bg dark:bg-dark-tertiary-bg px-1 rounded">.env</code> file in your project root</li>
                <li>Add your credentials to the .env file</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isVoiceSupported) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <AlertCircle className="w-20 h-20 text-accent-yellow mx-auto mb-6" />
          <h3 className="text-xl font-bold text-primary-text dark:text-dark-primary-text mb-4">
            Voice Assistant Not Available
          </h3>
          <div className="bg-accent-yellow/20 border-2 border-accent-yellow p-6 rounded-xl max-w-lg">
            <p className="text-accent-yellow font-semibold text-lg mb-4">
              Your browser doesn't support voice features.
            </p>
            <p className="text-secondary-text dark:text-dark-secondary-text text-sm">
              Please use a modern browser like Chrome, Safari, or Edge for the best experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <button
          onClick={handleToggleConversation}
          className={`w-40 h-40 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl ${
            buttonState === 'listening'
              ? 'bg-red-500 animate-bounce-gentle shadow-lg shadow-red-500/50 hover:shadow-red-500/70'
              : buttonState === 'speaking'
              ? 'bg-yellow-500 animate-breathe shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70'
              : buttonState === 'connecting'
              ? 'bg-blue-500 animate-breathe shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70'
              : 'bg-accent-pink hover:bg-accent-pink/90 shadow-xl shadow-accent-pink/40 animate-glow-pulse hover:shadow-accent-pink/60'
          }`}
        >
          {buttonState === 'listening' ? (
            <MicOff className="h-16 w-16 animate-pulse" />
          ) : buttonState === 'speaking' ? (
            <Volume2 className="h-16 w-16 animate-bounce" />
          ) : (
            <Mic className="h-16 w-16 transition-transform duration-200" />
          )}
        </button>
        
        {buttonState === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border-8 border-red-400 animate-ping opacity-75" />
            <div className="absolute inset-[-8px] rounded-full border-4 border-red-300 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        
        {(buttonState === 'speaking' || buttonState === 'connecting') && (
          <div className="absolute inset-[-4px] rounded-full border-4 border-current animate-ping opacity-30" />
        )}
      </div>

      <div className="text-center max-w-md">
        <p className="text-2xl font-bold mb-4">
          {getStatusLabel()}
        </p>
        
        <p className="text-secondary-text dark:text-dark-secondary-text text-lg mb-6">
          Say: "Create a reminder to take medicine at 7 AM"
        </p>

        {lastMessage && (
          <div className="bg-secondary-bg dark:bg-dark-secondary-bg p-6 rounded-xl mb-6 border border-primary-border dark:border-dark-primary-border">
            <p className="text-base text-secondary-text dark:text-dark-secondary-text mb-2">Assistant:</p>
            <p className="text-primary-text dark:text-dark-primary-text font-semibold text-lg">"{lastMessage}"</p>
          </div>
        )}

        {feedback && (
          <div className={`p-6 rounded-xl border-2 ${
            feedback.includes('Sorry') || feedback.includes('Error') || feedback.includes('denied') || feedback.includes('invalid')
              ? 'bg-accent-red/20 border-accent-red'
              : 'bg-accent-green/20 border-accent-green'
          }`}>
            <p className={`font-semibold text-lg ${
              feedback.includes('Sorry') || feedback.includes('Error') || feedback.includes('denied') || feedback.includes('invalid')
                ? 'text-accent-red'
                : 'text-accent-green'
            }`}>
              {feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}