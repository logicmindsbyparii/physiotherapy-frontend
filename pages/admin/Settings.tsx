import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Clock, Globe, MessageCircle, Save, Upload, X, Check } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface ClinicSettings {
  // Branding
  clinicName: string;
  logo: string; // base64 or URL
  primaryColor: string;
  secondaryColor: string;
  // Contact
  phone: string;
  email: string;
  address: string;
  website: string;
  // Hours
  workingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  // Integrations
  whatsappNumber: string;
  whatsappWelcomeMessage: string;
  emailNotifications: boolean;
  smsReminders: boolean;
  // General
  timezone: string;
  dateFormat: string;
}

const defaultSettings: ClinicSettings = {
  clinicName: 'PhysioCare Clinic',
  logo: '',
  primaryColor: '#0284c7',
  secondaryColor: '#0ea5e9',
  phone: '+1 (212) 555-0123',
  email: 'contact@physiocare.com',
  address: '123 Healthcare Ave, Downtown, NY 10001',
  website: 'https://physiocare.com',
  workingHours: {
    monday: '9:00 AM - 7:00 PM',
    tuesday: '9:00 AM - 7:00 PM',
    wednesday: '9:00 AM - 7:00 PM',
    thursday: '9:00 AM - 7:00 PM',
    friday: '9:00 AM - 7:00 PM',
    saturday: '10:00 AM - 4:00 PM',
    sunday: 'Closed',
  },
  whatsappNumber: '',
  whatsappWelcomeMessage: 'Hello! Thanks for reaching out. How can we help you today?',
  emailNotifications: true,
  smsReminders: true,
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
};

const timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Australia/Sydney'];
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

const Settings = () => {
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'hours' | 'integrations' | 'general'>('branding');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  // Load settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings`, getAuthHeaders());
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings({ ...defaultSettings, ...res.data });
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field: keyof ClinicSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleWorkingHoursChange = (day: keyof ClinicSettings['workingHours'], value: string) => {
    setSettings({
      ...settings,
      workingHours: { ...settings.workingHours, [day]: value },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = async () => {
    setSaveStatus('saving');
    try {
      await axios.put(`${API_BASE}/settings`, settings, getAuthHeaders());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save settings', err);
      setSaveStatus('idle');
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clinic Settings</h2>
          <p className="text-sm text-slate-500">Manage branding, contact info, and integrations.</p>
        </div>
        <button onClick={handleSaveAll} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg">
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save All</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex flex-wrap gap-2">
        {[
          { id: 'branding', label: 'Branding', icon: Building2 },
          { id: 'contact', label: 'Contact', icon: Phone },
          { id: 'hours', label: 'Working Hours', icon: Clock },
          { id: 'integrations', label: 'Integrations', icon: MessageCircle },
          { id: 'general', label: 'General', icon: Globe },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-sky-600 border-b-2 border-sky-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Clinic Logo</label>
              <div className="flex items-center gap-4">
                {settings.logo && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                    <button onClick={() => setSettings({ ...settings, logo: '' })} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
              <input type="text" className="w-full border rounded-lg p-2" value={settings.clinicName} onChange={e => handleChange('clinicName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="w-10 h-10 border rounded cursor-pointer" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} />
                  <input type="text" className="flex-1 border rounded-lg p-2" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="w-10 h-10 border rounded cursor-pointer" value={settings.secondaryColor} onChange={e => handleChange('secondaryColor', e.target.value)} />
                  <input type="text" className="flex-1 border rounded-lg p-2" value={settings.secondaryColor} onChange={e => handleChange('secondaryColor', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <div><label className="block text-sm font-medium mb-1">Phone Number</label><input type="text" className="w-full border rounded-lg p-2" value={settings.phone} onChange={e => handleChange('phone', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" className="w-full border rounded-lg p-2" value={settings.email} onChange={e => handleChange('email', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Full Address</label><textarea rows={2} className="w-full border rounded-lg p-2" value={settings.address} onChange={e => handleChange('address', e.target.value)} /></div>
            <div><label className="block text-sm font-medium mb-1">Website URL</label><input type="url" className="w-full border rounded-lg p-2" value={settings.website} onChange={e => handleChange('website', e.target.value)} /></div>
          </div>
        )}

        {/* Working Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-4">
            {Object.entries(settings.workingHours).map(([day, hours]) => (
              <div key={day} className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium capitalize">{day}</label>
                <input type="text" className="col-span-2 border rounded-lg p-2" value={hours} onChange={e => handleWorkingHoursChange(day as keyof ClinicSettings['workingHours'], e.target.value)} placeholder="e.g., 9:00 AM - 5:00 PM" />
              </div>
            ))}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp Integration</h3>
              <div><label className="block text-sm font-medium mb-1">WhatsApp Business Number</label><input type="text" className="w-full border rounded-lg p-2" placeholder="+1 234 567 8900" value={settings.whatsappNumber} onChange={e => handleChange('whatsappNumber', e.target.value)} /></div>
              <div className="mt-3"><label className="block text-sm font-medium mb-1">Auto‑reply Message</label><textarea rows={2} className="w-full border rounded-lg p-2" value={settings.whatsappWelcomeMessage} onChange={e => handleChange('whatsappWelcomeMessage', e.target.value)} /></div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Email & SMS Settings</h3>
              <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={settings.emailNotifications} onChange={e => handleChange('emailNotifications', e.target.checked)} /> Send email notifications for new appointments</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.smsReminders} onChange={e => handleChange('smsReminders', e.target.checked)} /> Send SMS reminders 24h before appointment</label>
            </div>
          </div>
        )}

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div><label className="block text-sm font-medium mb-1">Time Zone</label><select className="w-full border rounded-lg p-2" value={settings.timezone} onChange={e => handleChange('timezone', e.target.value)}>{timezones.map(tz => <option key={tz}>{tz}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Date Format</label><select className="w-full border rounded-lg p-2" value={settings.dateFormat} onChange={e => handleChange('dateFormat', e.target.value)}>{dateFormats.map(df => <option key={df}>{df}</option>)}</select></div>
            <div className="pt-4 border-t"><p className="text-xs text-slate-400">Settings are securely stored on the server for your clinic.</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;