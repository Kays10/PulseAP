import React, { useState, useEffect } from 'react';
import { userService, vpnService, authService } from '../services/api';
import { 
  Plus, 
  MapPin, 
  Network, 
  Settings as SettingsIcon, 
  Trash2, 
  Activity,
  Shield,
  Wifi
} from 'lucide-react';

const SitesZones = () => {
  const [sites, setSites] = useState([]);
  const [zones, setZones] = useState([]);
  const [controllers, setControllers] = useState([]);
  const [vpns, setVpns] = useState([]);
  const [aps, setAps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sites');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'site', 'zone', 'controller'
  const isAdmin = authService.isAdmin();

  // Form states
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesData, zonesData, controllersData, vpnsData, apsData] = await Promise.all([
        userService.getAllSites(),
        userService.getAllZones(),
        userService.getAllControllers(),
        vpnService.getAll(),
        userService.getAllAps()
      ]);
      setSites(sitesData);
      setZones(zonesData);
      setControllers(controllersData);
      setVpns(vpnsData);
      setAps(apsData);
    } catch (error) {
      console.error("Failed to fetch management data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    try {
      await userService.createSite(formData);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to create site");
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      await userService.createZone(formData);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to create zone");
    }
  };

  const handleAddController = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        vpn_profile_id: formData.vpn_profile_id || null,
        community_string: formData.community_string || null,
      };
      await userService.createController(submitData);
      setShowModal(false);
      fetchData();
      alert("Controller added! AP discovery triggered automatically.");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to create controller");
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center"><Activity className="animate-spin text-vod-yellow mr-2" /> Loading management data...</div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-fit">
        {[
          { id: 'sites', label: 'Sites', icon: MapPin },
          { id: 'zones', label: 'Zones', icon: Network },
          { id: 'controllers', label: 'Controllers', icon: SettingsIcon },
          { id: 'aps', label: 'Access Points', icon: Wifi }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
              activeTab === tab.id 
                ? 'bg-vod-dark text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black text-vod-dark uppercase tracking-tight">
            Manage {activeTab}
          </h3>
          {activeTab !== 'aps' && (
            <button 
              onClick={() => {
                setModalType(activeTab.slice(0, -1));
                setFormData({});
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-vod-yellow text-vod-dark px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-sm"
            >
              <Plus size={20} />
              Add {activeTab.slice(0, -1)}
            </button>
          )}
        </div>

        <div className="p-0">
          {activeTab === 'sites' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4">Zones</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sites.map(site => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-vod-dark">{site.name}</td>
                    <td className="px-8 py-5 text-gray-500">{site.description || '-'}</td>
                    <td className="px-8 py-5">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {zones.filter(z => z.site_id === site.id).length} Zones
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'zones' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">Site</th>
                  <th className="px-8 py-4">Controller</th>
                  <th className="px-8 py-4">APs</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {zones.map(zone => (
                  <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-vod-dark">{zone.name}</td>
                    <td className="px-8 py-5 text-gray-500">
                      {sites.find(s => s.id === zone.site_id)?.name}
                    </td>
                    <td className="px-8 py-5 text-gray-500">
                      {controllers.find(c => c.id === zone.controller_id)?.name}
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                        {aps.filter(ap => ap.zone_id === zone.id).length} APs
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'controllers' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">IP Address</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">VPN Link</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {controllers.map(controller => (
                  <tr key={controller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-vod-dark">{controller.name}</td>
                    <td className="px-8 py-5 font-mono text-xs text-gray-600">{controller.ip_address}</td>
                    <td className="px-8 py-5">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                        {controller.controller_type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {controller.vpn_profile_id ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <Shield size={14} />
                          {vpns.find(v => v.id === controller.vpn_profile_id)?.name}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No VPN</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'aps' && (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Name</th>
                  <th className="px-8 py-4">MAC / IP</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aps.map(ap => (
                  <tr key={ap.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-vod-dark">{ap.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">Zone: {zones.find(z => z.id === ap.zone_id)?.name}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-mono text-[11px] text-gray-600 uppercase">{ap.mac_address}</div>
                      <div className="font-mono text-[11px] text-gray-400">{ap.ip_address}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit ${
                        ap.status === 'online' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${ap.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {ap.status?.toUpperCase() || 'UNKNOWN'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs text-gray-500">
                      {ap.last_seen ? new Date(ap.last_seen).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-vod-dark/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-4 border-vod-dark">
            <div className="bg-vod-dark p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Add New {modalType}</h3>
              <button onClick={() => setShowModal(false)} className="hover:text-vod-yellow transition-colors font-bold">CANCEL</button>
            </div>
            
            <form onSubmit={
              modalType === 'site' ? handleAddSite : 
              modalType === 'zone' ? handleAddZone : 
              handleAddController
            } className="p-8 space-y-5">
              {modalType === 'site' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Site Name</label>
                    <input required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                      placeholder="e.g. Head Office"
                      onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                      placeholder="Optional details..."
                      onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                </>
              )}

              {modalType === 'zone' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Zone Name</label>
                    <input required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                      placeholder="e.g. Warehouse North"
                      onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Site</label>
                      <select required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                        onChange={e => setFormData({...formData, site_id: parseInt(e.target.value)})}>
                        <option value="">Select Site</option>
                        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Controller</label>
                      <select required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                        onChange={e => setFormData({...formData, controller_id: parseInt(e.target.value)})}>
                        <option value="">Select Controller</option>
                        {controllers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'controller' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Name</label>
                      <input required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                        placeholder="Primary SZ"
                        onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">IP Address</label>
                      <input required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-mono transition-all"
                        placeholder="10.x.x.x"
                        onChange={e => setFormData({...formData, ip_address: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type</label>
                      <select required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                        onChange={e => setFormData({...formData, controller_type: e.target.value})}>
                        <option value="">Select Type</option>
                        <option value="SmartZone">SmartZone</option>
                        <option value="ZoneDirector">ZoneDirector</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SNMP Version</label>
                      <select required className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                        onChange={e => setFormData({...formData, snmp_version: e.target.value})}>
                        <option value="v2c">v2c</option>
                        <option value="v3">v3</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Community String</label>
                    <input className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                      placeholder="public"
                      onChange={e => setFormData({...formData, community_string: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">VPN Profile (Optional)</label>
                    <select className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-vod-yellow outline-none font-medium transition-all"
                      onChange={e => setFormData({...formData, vpn_profile_id: e.target.value ? parseInt(e.target.value) : null})}>
                      <option value="">None (Direct Connection)</option>
                      {vpns.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="w-full bg-vod-dark text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl mt-4">
                SAVE {modalType.toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesZones;
