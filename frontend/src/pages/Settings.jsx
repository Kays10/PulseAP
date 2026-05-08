import React, { useState } from 'react';
import { userService } from '../services/api';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your account and application security.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-vod-dark p-6 text-white flex items-center gap-3">
          <Lock size={24} className="text-vod-yellow" />
          <h3 className="text-xl font-bold">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border border-green-100">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
              <input 
                required
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <input 
                  required
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                <input 
                  required
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              type="submit"
              className="w-full md:w-auto px-8 bg-vod-dark text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'UPDATE PASSWORD'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl h-fit">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Security Recommendation</h4>
          <p className="text-amber-800 text-sm mt-1 leading-relaxed">
            Ensure your new password is at least 12 characters long and contains a mix of uppercase letters, numbers, and symbols. VOD Group security policy requires periodic password updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
