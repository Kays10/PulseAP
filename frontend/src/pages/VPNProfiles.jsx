import React, { useState, useEffect } from 'react';
import { vpnService, authService } from '../services/api';
import { ShieldCheck, Plus, Power, PowerOff, Trash2 } from 'lucide-react';

const VPNProfiles = () => {
  const [vpns, setVpns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const isAdmin = authService.isAdmin();
  const [formData, setFormData] = useState({
    name: '',
    type: 'FORTI',
    host: '',
    port: '',
    username: '',
    password: '',
    config_file_path: ''
  });

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

  const handleAddVpn = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Clean up the data before sending
      const submitData = {
        name: formData.name,
        type: formData.type,
        host: formData.host,
        port: formData.port === '' || formData.port === null ? null : parseInt(formData.port),
        username: formData.username === '' ? null : formData.username,
        password: formData.password === '' ? null : formData.password,
        config_file_path: formData.config_file_path === '' ? null : formData.config_file_path,
      };
      
      console.log("Submitting VPN Data:", submitData);
      
      const response = await vpnService.create(submitData);
      console.log("VPN Created Successfully:", response);
      
      setShowModal(false);
      setFormData({
        name: '',
        type: 'FORTI',
        host: '',
        port: '',
        username: '',
        password: '',
        config_file_path: ''
      });
      fetchVpns();
    } catch (error) {
      console.error("VPN Creation Error Details:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Failed to add VPN profile";
      alert(`Error: ${errorMsg}`);
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
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-vod-dark text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-sm"
        >
          <Plus size={20} />
          Add Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vpns.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <ShieldCheck size={48} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No VPN Profiles Found</h3>
            <p className="text-gray-500 max-w-xs mt-2">
              Add your first VPN profile to start connecting to your remote network controllers.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="mt-6 flex items-center gap-2 bg-vod-dark text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            >
              <Plus size={20} />
              Add Your First Profile
            </button>
          </div>
        ) : vpns.map((vpn) => (
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
              {isAdmin ? (
                <>
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
                </>
              ) : (
                <div className="w-full text-center py-2 text-gray-400 text-xs italic">
                  Read-only Access
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add VPN Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-vod-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-4 border-vod-dark">
            <div className="bg-vod-dark p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Add VPN Profile</h3>
              <button onClick={() => setShowModal(false)} className="hover:text-vod-yellow transition-colors font-bold">CANCEL</button>
            </div>
            
            <form onSubmit={handleAddVpn} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Profile Name</label>
                  <input required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                    placeholder="e.g. Head Office VPN"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">VPN Type</label>
                  <select required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="FORTI">FortiGate (SSL)</option>
                    <option value="OPENVPN">OpenVPN</option>
                    <option value="WIREGUARD">WireGuard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Host / Server</label>
                  <input required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                    placeholder="vpn.example.com"
                    value={formData.host}
                    onChange={e => setFormData({...formData, host: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                  <input className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                    placeholder="vpnuser"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input type="password" className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Config Path / Port</label>
                <input className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-mono text-sm transition-all"
                  placeholder="e.g. 443 or /etc/openvpn/client.conf"
                  value={formData.config_file_path || formData.port}
                  onChange={e => {
                    const val = e.target.value;
                    if (formData.type === 'FORTI' && !isNaN(val)) {
                      setFormData({...formData, port: parseInt(val), config_file_path: ''});
                    } else {
                      setFormData({...formData, config_file_path: val, port: null});
                    }
                  }} />
              </div>

              <button type="submit" className="w-full bg-vod-dark text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl mt-4">
                SAVE VPN PROFILE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VPNProfiles;
