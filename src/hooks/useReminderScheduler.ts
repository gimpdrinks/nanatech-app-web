import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { speakText } from '../lib/elevenlabs';
import { useAuth } from '../contexts/AuthContext';
import { Reminder, RecurrencePattern } from '../types/reminders';

interface ReminderSchedulerOptions {
  checkInterval?: number; // milliseconds, default 30 seconds
  advanceNotice?: number; // minutes before reminder time to show notification
}

export function useReminderScheduler(options: ReminderSchedulerOptions = {}) {
  const { user } = useAuth();
  const { checkInterval = 30000, advanceNotice = 5 } = options;
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedReminders = useRef<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  const calculateNextRecurrence = (
    reminderTime: string,
    pattern: RecurrencePattern,
    recurrenceData?: any
  ): string | null => {
    if (pattern === 'none') return null;

    const currentDate = new Date(reminderTime);
    const now = new Date();

    switch (pattern) {
      case 'daily':
        // Add days until we get a future date
        while (currentDate <= now) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;

      case 'weekly':
        // Add weeks until we get a future date
        while (currentDate <= now) {
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;

      case 'monthly':
        // Add months until we get a future date
        while (currentDate <= now) {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;

      case 'yearly':
        // Add years until we get a future date
        while (currentDate <= now) {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        break;

      default:
        return null;
    }

    return currentDate.toISOString();
  };

  const showNotification = (reminder: Reminder) => {
    const title = reminder.title || 'Reminder';
    const body = `Don't forget: ${title}`;
    
    // Show browser notification if permission granted
    if (notificationPermission === 'granted') {
      try {
        const notification = new Notification(`🔔 ${title}`, {
          body,
          icon: '/vite.svg', // Use the app's icon
          badge: '/vite.svg',
          requireInteraction: true,
          tag: `reminder-${reminder.id}`, // Prevent duplicate notifications
        });

        // Auto-close notification after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }

    // Play audio notification
    const audioMessage = `Reminder: ${title}`;
    speakText(audioMessage);

    console.log(`🔔 Reminder triggered: ${title}`);
  };

  const processRecurringReminder = async (reminder: Reminder) => {
    if (!reminder.reminder_time || !reminder.recurrence_pattern) return;

    try {
      // Calculate next occurrence
      const nextReminderTime = calculateNextRecurrence(
        reminder.reminder_time,
        reminder.recurrence_pattern as RecurrencePattern,
        reminder.recurrence_data
      );

      if (!nextReminderTime) return;

      // Check if we've passed the end date
      if (reminder.end_recurrence_date) {
        const endDate = new Date(reminder.end_recurrence_date);
        const nextDate = new Date(nextReminderTime);
        
        if (nextDate > endDate) {
          // Mark as completed if past end date
          await supabase
            .from('reminders')
            .update({ is_completed: true })
            .eq('id', reminder.id);
          return;
        }
      }

      // Update reminder with next occurrence time
      await supabase
        .from('reminders')
        .update({ reminder_time: nextReminderTime })
        .eq('id', reminder.id);

      console.log(`🔄 Updated recurring reminder ${reminder.id} to next occurrence: ${nextReminderTime}`);
    } catch (error) {
      console.error('Error processing recurring reminder:', error);
    }
  };

  const markReminderAsCompleted = async (reminderId: string) => {
    try {
      await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId);
      
      console.log(`✅ Marked reminder ${reminderId} as completed`);
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
    }
  };

  const checkReminders = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + advanceNotice * 60 * 1000); // Add advance notice

      // Query for due reminders
      const { data: reminders, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .lte('reminder_time', futureTime.toISOString())
        .order('reminder_time', { ascending: true });

      if (error) {
        console.error('Error fetching reminders:', error);
        return;
      }

      if (!reminders || reminders.length === 0) return;

      // Process each due reminder
      for (const reminder of reminders) {
        // Skip if we've already notified about this reminder
        if (notifiedReminders.current.has(reminder.id)) continue;

        const reminderTime = new Date(reminder.reminder_time);
        
        // Check if reminder is actually due (within advance notice period)
        if (reminderTime <= futureTime) {
          // Mark as notified to prevent duplicate notifications
          notifiedReminders.current.add(reminder.id);

          // Show notification and play audio
          showNotification(reminder as Reminder);

          // Handle recurring vs one-time reminders
          if (reminder.is_recurring && reminder.recurrence_pattern !== 'none') {
            await processRecurringReminder(reminder as Reminder);
          } else {
            await markReminderAsCompleted(reminder.id);
          }

          // Clean up notified reminders set after some time to prevent memory leaks
          setTimeout(() => {
            notifiedReminders.current.delete(reminder.id);
          }, 24 * 60 * 60 * 1000); // 24 hours
        }
      }
    } catch (error) {
      console.error('Error in checkReminders:', error);
    }
  };

  const startScheduler = () => {
    if (intervalRef.current || !user) return;

    console.log('🚀 Starting reminder scheduler...');
    setIsActive(true);

    // Run initial check
    checkReminders();

    // Set up interval for regular checks
    intervalRef.current = setInterval(checkReminders, checkInterval);
  };

  const stopScheduler = () => {
    console.log('⏹️ Stopping reminder scheduler...');
    setIsActive(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear notified reminders when stopping
    notifiedReminders.current.clear();
  };

  // Auto-start when user is authenticated
  useEffect(() => {
    if (user && notificationPermission !== 'denied') {
      startScheduler();
    } else {
      stopScheduler();
    }

    // Cleanup on unmount
    return () => {
      stopScheduler();
    };
  }, [user, notificationPermission, checkInterval]);

  // Handle page visibility changes (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page hidden, pausing reminder scheduler...');
        stopScheduler();
      } else if (user && notificationPermission !== 'denied') {
        console.log('📱 Page visible, resuming reminder scheduler...');
        startScheduler();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, notificationPermission]);

  return {
    isActive,
    notificationPermission,
    startScheduler,
    stopScheduler,
    checkReminders: () => checkReminders(),
  };
}