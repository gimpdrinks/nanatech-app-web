import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ElevenLabsVoiceAgent from '../components/ElevenLabsVoiceAgent';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ManualReminderForm {
  type: string;
  title: string;
  reminder_date: string;
  reminder_time: string;
  is_recurring: boolean;
  recurrence_pattern: string;
  end_recurrence_date: string;
}

export default function VoicePage() {
  const { user } = useAuth();
  const [showManualForm, setShowManualForm] = useState(false);
  const [formData, setFormData] = useState<ManualReminderForm>({
    type: 'Others',
    title: '',
    reminder_date: '',
    reminder_time: '',
    is_recurring: false,
    recurrence_pattern: 'none',
    end_recurrence_date: '',
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Medicine', 'Bills', 'Birthday', 'Appointments', 'Others'];
  const recurrenceOptions = [
    { value: 'none', label: 'No repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title) return;

    setLoading(true);
    try {
      // Combine date and time into a single timestamp
      let reminderTime = null;
      if (formData.reminder_date && formData.reminder_time) {
        const [hours, minutes] = formData.reminder_time.split(':').map(Number);
        const reminderDate = new Date(formData.reminder_date);
        reminderDate.setHours(hours, minutes, 0, 0);
        reminderTime = reminderDate.toISOString();
      } else if (formData.reminder_time) {
        // If only time is provided, use today's date
        const today = new Date();
        const [hours, minutes] = formData.reminder_time.split(':').map(Number);
        today.setHours(hours, minutes, 0, 0);
        reminderTime = today.toISOString();
      }

      // Process end recurrence date
      let endRecurrenceDate = null;
      if (formData.is_recurring && formData.end_recurrence_date) {
        endRecurrenceDate = new Date(formData.end_recurrence_date).toISOString();
      }

      const { error } = await supabase.from('reminders').insert({
        user_id: user.id,
        type: formData.type,
        title: formData.title,
        reminder_time: reminderTime,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : 'none',
        end_recurrence_date: endRecurrenceDate,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Reset form
      setFormData({
        type: 'Others',
        title: '',
        reminder_date: '',
        reminder_time: '',
        is_recurring: false,
        recurrence_pattern: 'none',
        end_recurrence_date: '',
      });
      setShowManualForm(false);
    } catch (error) {
      console.error('Error saving reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary-text dark:text-dark-primary-text mb-4">Voice Assistant</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text text-lg">
          Speak to add reminders quickly and easily
        </p>
      </div>

      <ElevenLabsVoiceAgent onReminderCreated={() => {}} />

      <div className="text-center">
        <div className="border-t border-primary-border dark:border-dark-primary-border my-10 relative">
          <span className="bg-primary-bg dark:bg-dark-primary-bg px-6 text-secondary-text dark:text-dark-secondary-text text-base absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            or
          </span>
        </div>

        {!showManualForm ? (
          <button
            onClick={() => setShowManualForm(true)}
            className="inline-flex items-center space-x-3 bg-secondary-bg dark:bg-dark-secondary-bg border-2 border-primary-border dark:border-dark-primary-border text-primary-text dark:text-dark-primary-text px-8 py-4 rounded-xl hover:border-accent-green/30 transition-colors text-lg font-medium"
          >
            <Plus className="h-6 w-6" />
            <span>Type Reminder</span>
          </button>
        ) : (
          <div className="bg-secondary-bg dark:bg-dark-secondary-bg rounded-xl p-8 max-w-lg mx-auto border border-primary-border dark:border-dark-primary-border">
            <h3 className="text-xl font-bold text-primary-text dark:text-dark-primary-text mb-6">Add Manual Reminder</h3>
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-secondary-text dark:text-dark-secondary-text mb-3">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-4 py-3 text-primary-text dark:text-dark-primary-text text-base focus:border-accent-pink focus:outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-secondary-text dark:text-dark-secondary-text mb-3">
                  Reminder
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What do you want to be reminded about?"
                  className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-4 py-3 text-primary-text dark:text-dark-primary-text text-base placeholder-secondary-text dark:placeholder-dark-secondary-text focus:border-accent-pink focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-secondary-text dark:text-dark-secondary-text mb-3">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                  className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-4 py-3 text-primary-text dark:text-dark-primary-text text-base focus:border-accent-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-secondary-text dark:text-dark-secondary-text mb-3">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={formData.reminder_time}
                  onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                  className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-4 py-3 text-primary-text dark:text-dark-primary-text text-base focus:border-accent-pink focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      is_recurring: e.target.checked,
                      recurrence_pattern: e.target.checked ? 'daily' : 'none'
                    })}
                    className="w-5 h-5 text-accent-pink bg-dark-bg border-dark-border rounded focus:ring-accent-pink focus:ring-2"
                    className="w-5 h-5 text-accent-pink bg-primary-bg dark:bg-dark-primary-bg border-primary-border dark:border-dark-primary-border rounded focus:ring-accent-pink focus:ring-2"
                  />
                  <span className="text-base font-semibold text-secondary-text dark:text-dark-secondary-text">
                    Repeat this reminder
                  </span>
                </label>

                {formData.is_recurring && (
                  <div className="ml-8 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-tertiary-text dark:text-dark-tertiary-text mb-2">
                        How often?
                      </label>
                      <select
                        value={formData.recurrence_pattern}
                        onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                        className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-4 py-3 text-primary-text dark:text-dark-primary-text text-base focus:border-accent-pink focus:outline-none"
                      >
                        {recurrenceOptions.slice(1).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary-text dark:text-dark-tertiary-text mb-2">
                        Stop repeating after (optional)
                      </label>
                      <input
                        type="date"
                        value={formData.end_recurrence_date}
                        onChange={(e) => setFormData({ ...formData, end_recurrence_date: e.target.value })}
                        className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-4 py-3 text-primary-text dark:text-dark-primary-text text-base focus:border-accent-pink focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 py-3 px-6 border border-primary-border dark:border-dark-primary-border text-secondary-text dark:text-dark-secondary-text rounded-lg hover:bg-secondary-bg dark:hover:bg-dark-secondary-bg transition-colors text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.title}
                  className="flex-1 py-3 px-6 bg-accent-pink text-white rounded-lg hover:bg-accent-pink/80 transition-colors disabled:opacity-50 text-base font-medium"
                >
                  {loading ? 'Saving...' : 'Save Reminder'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}