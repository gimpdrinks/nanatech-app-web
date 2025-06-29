import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.name);
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg flex items-center justify-center p-4">
      <div className="bg-secondary-bg dark:bg-dark-secondary-bg rounded-xl p-8 max-w-md w-full border border-primary-border dark:border-dark-primary-border">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/Nanatech Lola.png"
              alt="Nanatech Lola - Friendly AI Assistant"
              className="w-24 h-24 mx-auto rounded-full shadow-lg"
              onError={(e) => {
                // Hide image if it fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-accent-pink mb-2">Nanatech</h1>
          <p className="text-secondary-text dark:text-dark-secondary-text">
            Voice AI Reminder Assistant for Seniors
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 pr-10 text-primary-text dark:text-dark-primary-text placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-accent-red/20 border border-accent-red/30 rounded-lg p-3">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-pink text-white py-3 px-6 rounded-lg hover:bg-accent-pink/80 transition-colors font-medium disabled:opacity-50"
          >
            {loading 
              ? 'Please wait...' 
              : isSignUp 
                ? 'Create Account' 
                : 'Sign In'
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent-pink hover:text-accent-pink/80 text-sm transition-colors"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        <div className="mt-8 p-4 bg-primary-bg dark:bg-dark-primary-bg rounded-lg">
          <p className="text-xs text-secondary-text dark:text-dark-secondary-text text-center">
            Designed with love for Filipino seniors and their families
          </p>
        </div>
      </div>
    </div>
  );
}