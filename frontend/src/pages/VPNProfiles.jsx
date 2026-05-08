import React, { useState, useEffect } from 'react';
import { vpnService } from '../services/api';
import { ShieldCheck, Plus, Power, PowerOff, Trash2 } from 'lucide-react';

const VPNProfiles = () => {
  const [vpns, setVpns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVpns();
  }, []);

  const fetchVpns = async () => {
    try {
      const data = await vpnService.getAll();
      setVpns(data);
    } catch (error) {
      console.error("Failed to fetch VPNs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (id) => {
    try {
      await vpnService.connect(id);
      fetchVpns();
    } catch (error) {
      alert("Failed to connect VPN");
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await vpnService.disconnect(id);
      fetchVpns();
    } catch (error) {
      alert("Failed to disconnect VPN");
    }
  };

  if (loading) return <div className="p-8">Loading VPN Profiles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">VPN Profiles</h2>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={20} />
          Add Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vpns.map((vpn) => (
          <div key={vpn.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${vpn.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{vpn.name}</h3>
                  <p className="text-sm text-gray-500 uppercase">{vpn.type}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                vpn.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {vpn.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm py-2">
              <div>
                <span className="text-gray-400 block">Host</span>
                <span className="text-gray-900 font-medium">{vpn.host}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Username</span>
                <span className="text-gray-900 font-medium">{vpn.username || 'N/A'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50">
              {vpn.status === 'connected' ? (
                <button 
                  onClick={() => handleDisconnect(vpn.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <PowerOff size={18} />
                  Disconnect
                </button>
              ) : (
                <button 
                  onClick={() => handleConnect(vpn.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Power size={18} />
                  Connect
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VPNProfiles;
