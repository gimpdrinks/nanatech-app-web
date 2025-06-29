import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Reminder } from '../types/reminders';
import ReminderCard from '../components/ReminderCard';


interface Profile {
  name: string;
  language: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todaysReminders, setTodaysReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, language')
        .eq('id', user?.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.full_name,
          language: profileData.language
        });
      }

      // Fetch today's reminders
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      
      const { data: remindersData } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user?.id)
        .gte('reminder_time', startOfDay)
        .lt('reminder_time', endOfDay)
        .order('reminder_time', { ascending: true });

      setTodaysReminders(remindersData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const isTaglish = profile?.language === 'tl';
    
    if (hour < 12) {
      return isTaglish ? 'Magandang umaga' : 'Good morning';
    } else if (hour < 18) {
      return isTaglish ? 'Magandang tanghali' : 'Good afternoon';
    } else {
      return isTaglish ? 'Magandang gabi' : 'Good evening';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-pink"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Greeting */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2"></h1>
        <h1 className="text-3xl font-bold text-primary-text dark:text-dark-primary-text mb-2">
          {getGreeting()}, {profile?.name || 'Friend'}!
        </h1>
        <p className="text-secondary-text dark:text-dark-secondary-text">
          {profile?.language === 'tl' 
            ? 'Ano ang mga reminder mo ngayon?' 
            : 'What reminders do you have today?'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/voice"
          className="bg-accent-pink rounded-xl p-8 text-center hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          <div className="text-white text-4xl mb-4">🎤</div>
          <p className="font-bold text-white text-lg mb-2">Voice Command</p>
          <p className="text-base text-pink-100">Add reminder by voice</p>
        </Link>

        <Link
          to="/reminders"
          className="bg-accent-green rounded-xl p-8 text-center hover:opacity-90 transition-all duration-200 shadow-lg"
        >
          <div className="text-white text-4xl mb-4">📋</div>
          <p className="font-bold text-white text-lg mb-2">View All</p>
          <p className="text-base text-green-100">Manage reminders</p>
        </Link>
      </div>

      {/* Today's Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Today's Reminders</h2>
          <Link
            to="/reminders"
            className="text-accent-pink hover:text-accent-pink/80 text-base font-medium"
          >
            View All
          </Link>
        </div>

        {todaysReminders.length === 0 ? (
          <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-8 text-center">
            <div className="text-8xl mb-6">🎉</div>
            <h3 className="text-xl font-bold text-primary-text dark:text-dark-primary-text mb-4">
              No reminders today!
            </h3>
            <p className="text-base text-secondary-text dark:text-dark-secondary-text mb-6">
              You're all caught up. Great job!
            </p>
            <Link
              to="/voice"
              className="inline-flex items-center space-x-3 bg-accent-pink text-white px-6 py-4 rounded-xl hover:bg-accent-pink/80 transition-colors text-lg font-medium"
            >
              <Plus className="h-6 w-6" />
              <span>Add Reminder</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysReminders.slice(0, 3).map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
            {todaysReminders.length > 3 && (
              <div className="text-center py-4">
                <Link
                  to="/reminders"
                  className="text-accent-pink hover:text-accent-pink/80 font-medium text-base"
                >
                  View {todaysReminders.length - 3} more reminders
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}