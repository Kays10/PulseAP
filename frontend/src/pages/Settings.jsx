import React, { useState } from 'react';
import { ShieldCheck, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { userService } from '../services/api';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInitDb = async () => {
    if (!window.confirm("This will initialize the database tables. Continue?")) return;
    
    setLoading(true);
    setStatus(null);
    try {
      const response = await userService.initDb();
      setStatus({ type: 'success', message: response.message });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.detail || "Failed to initialize database" });
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
          <Database size={24} className="text-vod-yellow" />
          <h3 className="text-xl font-bold">Database Management</h3>
        </div>

        <div className="p-8 space-y-6">
          {status && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
            <p className="text-blue-800 font-medium text-sm">
              Use this tool to create the necessary tables in your connected database. This only needs to be run once.
            </p>
            <button 
              onClick={handleInitDb}
              disabled={loading}
              className="mt-4 bg-vod-dark text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Database size={18} />
              {loading ? 'Initializing...' : 'Initialize Database Tables'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-vod-dark p-6 text-white flex items-center gap-3">
          <ShieldCheck size={24} className="text-vod-yellow" />
          <h3 className="text-xl font-bold">Authentication</h3>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
            <p className="text-gray-600 font-medium">
              This application uses Supabase for authentication. To manage your password or account details, please use the Supabase dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
