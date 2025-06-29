import React, { useState, useEffect } from 'react';
import { Save, Volume2, Type, Globe, PhoneCall, Phone, Plus, Edit3, Trash2, UserPlus, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Settings {
  language: string;
  fontSize: string;
  contrast: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone_number: string;
}

interface ContactFormData {
  name: string;
  relationship: string;
  phone_number: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    language: 'en',
    fontSize: 'medium',
    contrast: 'normal',
  });
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    relationship: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchEmergencyContacts();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', user?.id)
        .single();

      if (data) {
        setSettings(prev => ({
          ...prev,
          language: data.language || 'en',
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchEmergencyContacts = async () => {
    try {
      console.log('🔍 Fetching emergency contacts...');
      console.log('👤 Current user ID:', user?.id);
      
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      console.log('📡 Supabase response - Data:', data);
      console.log('📡 Supabase response - Error:', error);
      console.log('📊 Data length:', data ? data.length : 'null/undefined');

      if (error) throw error;
      
      console.log('✅ Setting emergency contacts state with:', data || []);
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      console.error('💥 Full error details:', JSON.stringify(error, null, 2));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          language: settings.language,
          theme: theme 
        })
        .eq('id', user.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactForm.name || !contactForm.phone_number) return;

    setContactLoading(true);
    try {
      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: contactForm.name,
            relationship: contactForm.relationship,
            phone_number: contactForm.phone_number,
          })
          .eq('id', editingContact.id);

        if (error) throw error;
      } else {
        // Create new contact
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name: contactForm.name,
            relationship: contactForm.relationship,
            phone_number: contactForm.phone_number,
          });

        if (error) throw error;
      }

      // Reset form and refresh contacts
      setContactForm({ name: '', relationship: '', phone_number: '' });
      setShowContactForm(false);
      setEditingContact(null);
      fetchEmergencyContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setContactLoading(false);
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setContactForm({
      name: contact.name,
      relationship: contact.relationship,
      phone_number: contact.phone_number,
    });
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      fetchEmergencyContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleDialContact = (phoneNumber: string, name: string) => {
    // Create tel: link to trigger phone call
    const telLink = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    window.location.href = telLink;
  };

  const testVoice = () => {
    const text = settings.language === 'tl' 
      ? 'Kumusta! Ito ang inyong voice assistant.' 
      : 'Hello! This is your voice assistant.';
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Settings</h1>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            {theme === 'light' ? (
              <Sun className="h-6 w-6 text-accent-yellow" />
            ) : (
              <Moon className="h-6 w-6 text-accent-blue" />
            )}
            <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Theme</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="text-accent-pink focus:ring-accent-pink"
              />
              <div className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-accent-yellow" />
                <span className="text-primary-text dark:text-dark-primary-text">Light Mode</span>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="text-accent-pink focus:ring-accent-pink"
              />
              <div className="flex items-center space-x-2">
                <Moon className="h-5 w-5 text-accent-blue" />
                <span className="text-primary-text dark:text-dark-primary-text">Dark Mode</span>
              </div>
            </label>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <PhoneCall className="h-6 w-6 text-accent-red" />
              <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Emergency Contacts</h3>
            </div>
            <button
              onClick={() => {
                setContactForm({ name: '', relationship: '', phone_number: '' });
                setEditingContact(null);
                setShowContactForm(true);
              }}
              className="flex items-center space-x-2 bg-accent-green/20 border border-accent-green/30 text-accent-green px-3 py-2 rounded-lg hover:bg-accent-green/30 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {emergencyContacts.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-secondary-text dark:text-dark-secondary-text mx-auto mb-3" />
              <p className="text-secondary-text dark:text-dark-secondary-text mb-4">No emergency contacts added yet</p>
              <button
                onClick={() => setShowContactForm(true)}
                className="inline-flex items-center space-x-2 bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Emergency Contact</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg p-4"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-text dark:text-dark-primary-text text-lg">{contact.name}</h4>
                    <p className="text-secondary-text dark:text-dark-secondary-text text-sm">{contact.relationship}</p>
                    <p className="text-secondary-text dark:text-dark-secondary-text text-sm">{contact.phone_number}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDialContact(contact.phone_number, contact.name)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors shadow-lg"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="font-semibold">Call</span>
                    </button>
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-3 text-secondary-text dark:text-dark-secondary-text hover:text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-3 text-secondary-text dark:text-dark-secondary-text hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Form Modal/Inline */}
          {showContactForm && (
            <div className="mt-6 bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg p-6">
              <h4 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </h4>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text focus:border-accent-pink focus:outline-none"
                    placeholder="Contact name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    className="w-full bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text focus:border-accent-pink focus:outline-none"
                    placeholder="e.g., Son, Daughter, Doctor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone_number}
                    onChange={(e) => setContactForm({ ...contactForm, phone_number: e.target.value })}
                    className="w-full bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text focus:border-accent-pink focus:outline-none"
                    placeholder="+63 917 123 4567"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactForm(false);
                      setEditingContact(null);
                      setContactForm({ name: '', relationship: '', phone_number: '' });
                    }}
                    className="flex-1 py-2 px-4 border border-primary-border dark:border-dark-primary-border text-secondary-text dark:text-dark-secondary-text rounded-lg hover:bg-secondary-bg dark:hover:bg-dark-secondary-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="flex-1 py-2 px-4 bg-accent-green text-white rounded-lg hover:bg-accent-green/80 transition-colors disabled:opacity-50"
                  >
                    {contactLoading ? 'Saving...' : editingContact ? 'Update' : 'Add Contact'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Language Settings */}
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-6 w-6 text-accent-pink" />
            <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Language</h3>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="language"
                value="en"
                checked={settings.language === 'en'}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="text-accent-pink focus:ring-accent-pink"
              />
              <span className="text-primary-text dark:text-dark-primary-text">English</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="language"
                value="tl"
                checked={settings.language === 'tl'}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="text-accent-pink focus:ring-accent-pink"
              />
              <span className="text-primary-text dark:text-dark-primary-text">Taglish (Filipino + English)</span>
            </label>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="h-6 w-6 text-accent-green" />
            <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Voice</h3>
          </div>
          
          <button
            onClick={testVoice}
            className="bg-accent-green/20 border border-accent-green/30 text-accent-green px-4 py-2 rounded-lg hover:bg-accent-green/30 transition-colors"
          >
            Test Voice
          </button>
        </div>

        {/* Display Settings */}
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Type className="h-6 w-6 text-accent-yellow" />
            <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Display</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                Font Size
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
                className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text focus:border-accent-pink focus:outline-none"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-text dark:text-dark-secondary-text mb-2">
                Contrast
              </label>
              <select
                value={settings.contrast}
                onChange={(e) => setSettings({ ...settings, contrast: e.target.value })}
                className="w-full bg-primary-bg dark:bg-dark-primary-bg border border-primary-border dark:border-dark-primary-border rounded-lg px-3 py-2 text-primary-text dark:text-dark-primary-text focus:border-accent-pink focus:outline-none"
              >
                <option value="normal">Normal</option>
                <option value="high">High Contrast</option>
              </select>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-secondary-bg dark:bg-dark-secondary-bg border border-primary-border dark:border-dark-primary-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-3">About Nanatech</h3>
          <div className="space-y-2 text-sm text-secondary-text dark:text-dark-secondary-text">
            <p>Version 1.0.0</p>
            <p>Voice AI Reminder Assistant for Seniors</p>
            <p>Made with ❤️ for our Filipino elders</p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-accent-green text-white'
              : 'bg-accent-pink text-white hover:bg-accent-pink/80'
          }`}
        >
          <Save className="h-5 w-5" />
          <span>
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </span>
        </button>
      </div>
    </div>
  );
}