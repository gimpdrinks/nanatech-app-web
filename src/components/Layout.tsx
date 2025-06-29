import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Mic, Calendar, BookOpen, Settings, User, PhoneCall } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReminderScheduler } from '../hooks/useReminderScheduler';

export default function Layout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { notificationPermission } = useReminderScheduler();

  const handleEmergencyCall = () => {
    // Placeholder for emergency call functionality
    // TODO: Implement actual emergency calling feature
    console.log('Emergency button pressed - calling emergency contact...');
    
    // For now, show an alert to indicate the button was pressed
    alert('Emergency button activated! This will call your emergency contact when fully implemented.');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Reminders', href: '/reminders', icon: Calendar },
    { name: 'Voice', href: '/voice', icon: Mic },
    { name: 'Tutorials', href: '/tutorials', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="min-h-screen bg-primary-bg dark:bg-dark-primary-bg">
        <header className="bg-secondary-bg dark:bg-dark-secondary-bg border-b border-primary-border dark:border-dark-primary-border px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <img
                src="/Nanatech Lola.png"
                alt="Nanatech Lola - AI Assistant"
                className="w-10 h-10 rounded-full shadow-lg"
                onError={(e) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <h1 className="text-2xl font-bold text-accent-pink">Nanatech</h1>
            </div>
            <div className="flex items-center space-x-4">
              {notificationPermission === 'denied' && (
                <div className="bg-accent-yellow/20 border border-accent-yellow/30 px-3 py-1 rounded-lg">
                  <span className="text-accent-yellow text-sm font-medium">
                    Enable notifications for reminders
                  </span>
                </div>
              )}
              <button
                onClick={handleEmergencyCall}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                <PhoneCall className="h-5 w-5" />
                <span className="text-base font-semibold">Emergency</span>
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text p-2"
              >
                <User className="h-6 w-6" />
                <span className="text-base">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-4 py-6">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-secondary-bg dark:bg-dark-secondary-bg border-t border-primary-border dark:border-dark-primary-border">
          <div className="flex justify-around items-center py-4 max-w-4xl mx-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center space-y-2 py-3 px-4 rounded-lg min-w-[80px] ${
                    isActive
                      ? 'text-accent-pink bg-accent-pink/10'
                      : 'text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text'
                  }`}
                >
                  <item.icon className={`${item.name === 'Voice' ? 'h-10 w-10' : 'h-8 w-8'}`} />
                  <span className={`text-sm font-medium ${item.name === 'Voice' ? 'text-base font-bold' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}