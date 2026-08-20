'use client'
import { getTenantSettings, updateTenantSettings } from '@/lib/api/settings';
import React, { useState, useEffect, use } from 'react';

export default function TenantAdminSettings({params}) {
    const {subdomain}=use(params)
  const [settings, setSettings] = useState({
    appName: '',
    themeColor: '#3b82f6',
    enableNotifications: true,
    bookingSlotDuration: 30,
    timeZone: 'UTC',
  });

  const [dataSource, setDataSource] = useState(''); // 'cache', 'db', or 'db-fallback'
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'

  // Fetch Tenant Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getTenantSettings(subdomain)
      const result = await res.json();
      
      if (res.ok && result.data) {
        setSettings(result.data);
        setDataSource(result.source);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [subdomain]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit Updated Settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingStatus('saving');

    try {
      const res = await updateTenantSettings(subdomain,settings)

      const result = await res.json();

      if (res.ok && result.data) {
        setSettings(result.data);
        setDataSource(result.source);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 3000);
      } else {
        setSavingStatus('error');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      setSavingStatus('error');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tenant configuration...</div>;
  }

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      
      {/* Header & Cache Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Tenant Admin Settings</h2>
        
        {/* Cache / DB Status Badge */}
        <div>
          {dataSource === 'cache' && (
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              ⚡ Cached (Redis)
            </span>
          )}
          {dataSource === 'db' && (
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              🗄️ Database (Direct)
            </span>
          )}
          {dataSource === 'db-fallback' && (
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              ⚠️ DB Fallback (Redis Down)
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* App Name */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>App Name</label>
          <input
            type="text"
            name="appName"
            value={settings.appName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        {/* Theme Primary Color */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Theme Primary Color</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="color"
              name="themeColor"
              value={settings.themeColor}
              onChange={handleChange}
              style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
            />
            <span>{settings.themeColor}</span>
          </div>
        </div>

        {/* Slot Duration */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Booking Slot Duration (Mins)</label>
          <input
            type="number"
            name="bookingSlotDuration"
            value={settings.bookingSlotDuration}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Enable Notifications */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="enableNotifications"
            name="enableNotifications"
            checked={settings.enableNotifications}
            onChange={handleChange}
          />
          <label htmlFor="enableNotifications" style={{ fontWeight: '600' }}>Enable Email Notifications</label>
        </div>

        {/* Save Button & Saving State Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="submit"
            disabled={savingStatus === 'saving'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: savingStatus === 'saving' ? 'not-allowed' : 'pointer',
            }}
          >
            {savingStatus === 'saving' ? 'Saving...' : 'Save Settings'}
          </button>

          {/* Real-time Save Status Indicators */}
          {savingStatus === 'saved' && (
            <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>
              ✅ Settings Saved & Cache Updated!
            </span>
          )}
          {savingStatus === 'error' && (
            <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px' }}>
              ❌ Failed to save settings.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}