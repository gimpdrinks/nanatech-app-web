import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Reminder } from '../types/reminders';
import ReminderCard from '../components/ReminderCard';


export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Medicine', 'Bills', 'Birthday', 'Appointments', 'Others'];

  const categoryColors = {
    All: {
      active: 'bg-accent-pink text-white shadow-lg shadow-accent-pink/30',
      inactive: 'bg-accent-pink/10 text-accent-pink border-2 border-accent-pink/30 hover:bg-accent-pink/20'
    },
    Medicine: {
      active: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
      inactive: 'bg-red-500/10 text-red-400 border-2 border-red-500/30 hover:bg-red-500/20'
    },
    Bills: {
      active: 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30',
      inactive: 'bg-yellow-500/10 text-yellow-400 border-2 border-yellow-500/30 hover:bg-yellow-500/20'
    },
    Birthday: {
      active: 'bg-purple-500 text-white shadow-lg shadow-purple-500/30',
      inactive: 'bg-purple-500/10 text-purple-400 border-2 border-purple-500/30 hover:bg-purple-500/20'
    },
    Appointments: {
      active: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
      inactive: 'bg-blue-500/10 text-blue-400 border-2 border-blue-500/30 hover:bg-blue-500/20'
    },
    Others: {
      active: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30',
      inactive: 'bg-gray-500/10 text-gray-400 border-2 border-gray-500/30 hover:bg-gray-500/20'
    }
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredReminders(reminders);
    } else {
      setFilteredReminders(reminders.filter(r => r.type === activeFilter));
    }
  }, [reminders, activeFilter]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user?.id)
        .order('reminder_time', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    // For now, just log - in a real app, you'd open an edit modal
    console.log('Edit reminder:', reminder);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-text dark:text-dark-primary-text">My Reminders</h1>
        <Link
          to="/voice"
          className="inline-flex items-center space-x-3 bg-accent-pink text-white px-6 py-3 rounded-xl hover:bg-accent-pink/80 transition-colors text-base font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Add New</span>
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-3">
        <Filter className="h-6 w-6 text-secondary-text dark:text-dark-secondary-text flex-shrink-0" />
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-5 py-3 rounded-full text-base font-bold whitespace-nowrap transition-all duration-200 ${
              activeFilter === category
                ? categoryColors[category as keyof typeof categoryColors].active
                : categoryColors[category as keyof typeof categoryColors].inactive
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-8 text-center">
          <div className="text-8xl mb-6">📝</div>
          <h3 className="text-xl font-bold text-primary-text dark:text-dark-primary-text mb-4">
            {activeFilter === 'All' ? 'No reminders yet' : `No ${activeFilter.toLowerCase()} reminders`}
          </h3>
          <p className="text-base text-secondary-text dark:text-dark-secondary-text mb-6">
            Get started by adding your first reminder using voice or text.
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
        <div className="space-y-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}