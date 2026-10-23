import { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Database, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'system', label: 'System', icon: Database },
];

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage your account preferences and application configuration.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab sidebar */}
        <div className="md:w-48 shrink-0">
          <div className="card p-2 space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`settings-tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Profile Information</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input id="settings-name" type="text" defaultValue={user?.name || ''} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input id="settings-email" type="email" defaultValue={user?.email || ''} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                    disabled
                    className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <button id="settings-save-profile-btn" className="btn-primary mt-2" disabled>
                  <Save className="w-4 h-4" /> Save changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Security</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
                  <input id="settings-current-password" type="password" placeholder="••••••••" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                  <input id="settings-new-password" type="password" placeholder="Min. 6 characters" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
                  <input id="settings-confirm-password" type="password" placeholder="Re-enter new password" className="input" />
                </div>
                <button id="settings-update-password-btn" className="btn-primary mt-2" disabled>
                  <Lock className="w-4 h-4" /> Update password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Notification Preferences</h2>
              <p className="text-sm text-gray-500">
                Notification configuration will be available in a future phase. You will be able to set
                alert thresholds for low stock, overstock, and demand spike notifications.
              </p>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5">System</h2>
              <p className="text-sm text-gray-500">
                System configuration (data retention, integrations, API keys) will be available in a future phase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
