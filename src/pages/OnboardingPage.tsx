import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, User, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface OnboardingData {
  name: string;
  language: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    language: 'en',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  });
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const startListening = (field: string) => {
    setIsListening(true);
    
    // Simulate voice input with sample data
    setTimeout(() => {
      if (field === 'name') {
        setData({ ...data, name: 'Maria Santos' });
      } else if (field === 'emergencyName') {
        setData({
          ...data,
          emergencyContact: { ...data.emergencyContact, name: 'Juan Santos' }
        });
      } else if (field === 'emergencyRelationship') {
        setData({
          ...data,
          emergencyContact: { ...data.emergencyContact, relationship: 'Son' }
        });
      } else if (field === 'emergencyPhone') {
        setData({
          ...data,
          emergencyContact: { ...data.emergencyContact, phone: '+63 917 123 4567' }
        });
      }
      setIsListening(false);
    }, 2000);
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: data.name,
        language: data.language,
      });

      // Save emergency contact
      await supabase.from('emergency_contacts').insert({
        user_id: user.id,
        name: data.emergencyContact.name,
        relationship: data.emergencyContact.relationship,
        phone_number: data.emergencyContact.phone,
      });

      // Simulate SMS sending
      setSmsSent(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (smsSent) {
    return (
      <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg flex items-center justify-center p-4">
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mb-4">Setup Complete!</h2>
          <p className="text-secondary-text dark:text-dark-secondary-text mb-4">
            SMS sent to {data.emergencyContact.name} at {data.emergencyContact.phone}
          </p>
          <div className="bg-accent-green/20 border border-accent-green/30 rounded-lg p-4">
            <p className="text-accent-green text-sm">
              "Hi {data.emergencyContact.name}, {data.name} has set up Nanatech, a voice reminder app. 
              You're listed as their emergency contact. - Nanatech Team"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg flex items-center justify-center p-4">
      <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-8 max-w-md w-full">
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">
              Welcome to Nanatech!
            </h1>
            <p className="text-secondary-text dark:text-dark-secondary-text">
              Your personal voice AI reminder assistant, designed especially for seniors.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-accent-pink text-white py-3 px-6 rounded-lg hover:bg-accent-pink/80 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-accent-pink mx-auto mb-4" />
              <h2 className="text-xl font-bold text-primary-text dark:text-dark-primary-text">What's your name?</h2>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Enter your name"
                  className="flex-1 bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                />
                <button
                  onClick={() => startListening('name')}
                  disabled={isListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-accent-pink hover:bg-accent-pink/80'
                  } text-white transition-colors`}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                  Preferred Language
                </label>
                <select
                  value={data.language}
                  onChange={(e) => setData({ ...data, language: e.target.value })}
                  className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text focus:border-accent-pink focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="tl">Taglish (Filipino + English)</option>
                </select>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!data.name}
                className="w-full bg-accent-pink text-white py-3 px-6 rounded-lg hover:bg-accent-pink/80 transition-colors font-medium disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-accent-green mx-auto mb-4" />
              <h2 className="text-xl font-bold text-primary-text dark:text-dark-primary-text">Emergency Contact</h2>
              <p className="text-secondary-text dark:text-dark-secondary-text text-sm">
                We'll notify them when you set up important reminders
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={data.emergencyContact.name}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, name: e.target.value }
                  })}
                  placeholder="Contact name"
                  className="flex-1 bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                />
                <button
                  onClick={() => startListening('emergencyName')}
                  disabled={isListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-accent-pink hover:bg-accent-pink/80'
                  } text-white transition-colors`}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  value={data.emergencyContact.relationship}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, relationship: e.target.value }
                  })}
                  placeholder="Relationship (e.g., son, daughter)"
                  className="flex-1 bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                />
                <button
                  onClick={() => startListening('emergencyRelationship')}
                  disabled={isListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-accent-pink hover:bg-accent-pink/80'
                  } text-white transition-colors`}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              <div className="flex space-x-3">
                <input
                  type="tel"
                  value={data.emergencyContact.phone}
                  onChange={(e) => setData({
                    ...data,
                    emergencyContact: { ...data.emergencyContact, phone: e.target.value }
                  })}
                  placeholder="Phone number"
                  className="flex-1 bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                />
                <button
                  onClick={() => startListening('emergencyPhone')}
                  disabled={isListening}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-accent-pink hover:bg-accent-pink/80'
                  } text-white transition-colors`}
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={handleComplete}
                disabled={loading || !data.emergencyContact.name || !data.emergencyContact.phone}
                className="w-full bg-accent-green text-white py-3 px-6 rounded-lg hover:bg-accent-green/80 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= step ? 'bg-accent-pink' : 'bg-secondary-text dark:bg-dark-secondary-text'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}