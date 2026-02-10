'use client';

import { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import Link from 'next/link';

interface ConsentSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: '',
  });

  useEffect(() => {
    const consent = getLocalStorage<ConsentSettings | null>('cookie-consent', null);
    if (!consent) {
      setShowBanner(true);
    } else {
      setSettings(consent);
      // Initialize analytics if consented
      if (consent.analytics) {
        initializeAnalytics();
      }
    }
  }, []);

  const initializeAnalytics = () => {
    // GA4 initialization happens in Analytics component
    window.dispatchEvent(new CustomEvent('analytics-consent-granted'));
  };

  const acceptAll = () => {
    const newSettings: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    setLocalStorage('cookie-consent', newSettings);
    setSettings(newSettings);
    setShowBanner(false);
    initializeAnalytics();
  };

  const acceptNecessary = () => {
    const newSettings: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    setLocalStorage('cookie-consent', newSettings);
    setSettings(newSettings);
    setShowBanner(false);
  };

  const saveSettings = () => {
    const newSettings = {
      ...settings,
      timestamp: new Date().toISOString(),
    };
    setLocalStorage('cookie-consent', newSettings);
    setShowBanner(false);
    setShowSettings(false);
    if (settings.analytics) {
      initializeAnalytics();
    }
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="container mx-auto max-w-4xl">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h2 id="cookie-consent-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                🍪 Cookie Consent
              </h2>
              <p id="cookie-consent-description" className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your experience, analyze traffic, and serve personalized ads. 
                Read our <Link href="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cookie Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Necessary</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Required for the website to function</p>
                </div>
                <input type="checkbox" checked disabled className="w-5 h-5 rounded" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Analytics</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Help us improve our website</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.analytics} 
                  onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Marketing</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Personalized advertisements</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.marketing} 
                  onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

