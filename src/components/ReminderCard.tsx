import React from 'react';
import { Trash2, Edit3, Pill, CreditCard, Gift, Calendar, FileText } from 'lucide-react';
import { Reminder } from '../types/reminders';


interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const categoryIcons = {
  Medicine: Pill,
  Bills: CreditCard,
  Birthday: Gift,
  Appointments: Calendar,
  Others: FileText,
};

const categoryColors = {
  Medicine: 'text-accent-red bg-accent-red/10',
  Bills: 'text-accent-yellow bg-accent-yellow/10',
  Birthday: 'text-accent-purple bg-accent-purple/10',
  Appointments: 'text-accent-blue bg-accent-blue/10',
  Others: 'text-secondary-text dark:text-dark-secondary-text bg-secondary-text/10 dark:bg-dark-secondary-text/10',
};

export default function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
  const reminderType = reminder.type || 'Others';
  const reminderTitle = reminder.title || 'Untitled Reminder';
  
  const IconComponent = categoryIcons[reminderType as keyof typeof categoryIcons] || FileText;
  const colorClass = categoryColors[reminderType as keyof typeof categoryColors] || categoryColors.Others;

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'Unknown date';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid (not NaN and not Unix epoch)
      if (isNaN(date.getTime()) || date.getTime() === 0) {
        return 'Unknown date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };

  const formatReminderTime = (reminderTime: string | null) => {
    if (!reminderTime) return null;
    
    try {
      const date = new Date(reminderTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Reset time parts for date comparison
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      
      const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
      
      if (dateOnly.getTime() === todayOnly.getTime()) {
        return `Today, ${timeString}`;
      } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
        return `Tomorrow, ${timeString}`;
      } else {
        return `${dateString}, ${timeString}`;
      }
    } catch (error) {
      console.error('Error formatting reminder time:', error);
      return reminderTime;
    }
  };

  const getRecurrenceLabel = (pattern: string | null | undefined) => {
    if (!pattern || pattern === 'none') return null;
    
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly', 
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    
    return labels[pattern as keyof typeof labels] || pattern;
  };
  return (
    <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-lg p-6 hover:border-accent-pink/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <IconComponent className="h-7 w-7" />
          </div>
          <div>
            <p className="font-bold text-primary-text dark:text-dark-primary-text text-lg">{reminderTitle}</p>
            <p className="text-base text-secondary-text dark:text-dark-secondary-text">{reminderType}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(reminder)}
            className="p-3 text-secondary-text dark:text-dark-secondary-text hover:text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors"
          >
            <Edit3 className="h-6 w-6" />
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-3 text-secondary-text dark:text-dark-secondary-text hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-base">
        {reminder.reminder_time ? (
          <div className="flex flex-col">
            <span className="text-accent-pink font-semibold">
              {formatReminderTime(reminder.reminder_time)}
            </span>
            {reminder.is_recurring && getRecurrenceLabel(reminder.recurrence_pattern) && (
              <span className="text-accent-green text-sm font-medium">
                Repeats {getRecurrenceLabel(reminder.recurrence_pattern)}
              </span>
            )}
          </div>
        ) : (
          <span className="text-tertiary-text dark:text-dark-tertiary-text">No time set</span>
        )}
        {reminder.created_at && (
          <span className="text-tertiary-text dark:text-dark-tertiary-text">
            Added {formatDate(reminder.created_at)}
          </span>
        )}
      </div>
    </div>
  );
}