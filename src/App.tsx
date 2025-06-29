import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import { useReminderScheduler } from './hooks/useReminderScheduler';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import VoicePage from './pages/VoicePage';
import RemindersPage from './pages/RemindersPage';
import TutorialsPage from './pages/TutorialsPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  
  // Initialize reminder scheduler
  const reminderScheduler = useReminderScheduler({
    checkInterval: 30000, // Check every 30 seconds
    advanceNotice: 2, // Show notifications 2 minutes before reminder time
  });

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle();
      
      setHasProfile(!!data);
    } catch (error) {
      setHasProfile(false);
    }
  };

  if (loading || (user && hasProfile === null)) {
    return (
      <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-pink mx-auto mb-4"></div>
          <p className="text-secondary-text dark:text-dark-secondary-text">Loading your reminders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!hasProfile) {
    return <OnboardingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="voice" element={<VoicePage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="tutorials" element={<TutorialsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;