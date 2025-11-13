import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    browserNotifications: true,
    reminderTiming: '1_day',
    assignmentReminders: true,
    examReminders: true,
    projectReminders: true,
    dailyDigest: true,
    digestTime: '08:00'
  });

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    
    // Show success message
    alert('Notification settings saved successfully!');
    onClose();
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings({ ...settings, browserNotifications: true });
      }
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Notification Settings
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Browser Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Browser Notifications</h3>
                    <p className="text-xs text-gray-500">Show popup notifications in your browser</p>
                  </div>
                </div>
                <button
                  onClick={handleRequestNotificationPermission}
                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Enable
                </button>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-xs text-gray-500">Send reminders to your email address</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Reminder Timing */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Default Reminder Timing
              </label>
              <select
                value={settings.reminderTiming}
                onChange={(e) => setSettings({ ...settings, reminderTiming: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1_hour">1 hour before</option>
                <option value="6_hours">6 hours before</option>
                <option value="1_day">1 day before</option>
                <option value="2_days">2 days before</option>
                <option value="1_week">1 week before</option>
              </select>
            </div>

            {/* Event Type Reminders */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Event Type Reminders</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Assignments</span>
                  <input
                    type="checkbox"
                    checked={settings.assignmentReminders}
                    onChange={(e) => setSettings({ ...settings, assignmentReminders: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Exams</span>
                  <input
                    type="checkbox"
                    checked={settings.examReminders}
                    onChange={(e) => setSettings({ ...settings, examReminders: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Projects</span>
                  <input
                    type="checkbox"
                    checked={settings.projectReminders}
                    onChange={(e) => setSettings({ ...settings, projectReminders: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Daily Digest */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Daily Digest</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm text-gray-700">Enable daily digest</span>
                    <p className="text-xs text-gray-500">Summary of upcoming events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dailyDigest}
                    onChange={(e) => setSettings({ ...settings, dailyDigest: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
                {settings.dailyDigest && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Digest Time
                    </label>
                    <input
                      type="time"
                      value={settings.digestTime}
                      onChange={(e) => setSettings({ ...settings, digestTime: e.target.value })}
                      className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Save Settings
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default NotificationSettings;