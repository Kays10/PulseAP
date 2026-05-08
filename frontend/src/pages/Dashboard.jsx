import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, detail }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{detail}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sitesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getSitesSummary()
        ]);
        setStats(statsData);
        setSites(sitesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(setLoading(false));
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total APs" 
          value={stats?.total_aps || 0} 
          icon={Activity} 
          color="bg-blue-500"
          detail="All monitored devices"
        />
        <StatCard 
          title="Online" 
          value={stats?.online_aps || 0} 
          icon={Wifi} 
          color="bg-green-500"
          detail="Currently connected"
        />
        <StatCard 
          title="Offline" 
          value={stats?.offline_aps || 0} 
          icon={WifiOff} 
          color="bg-red-500"
          detail="Need attention"
        />
        <StatCard 
          title="Sites" 
          value={stats?.total_sites || 0} 
          icon={MapPin} 
          color="bg-purple-500"
          detail="Managed locations"
        />
      </div>

      {/* Sites Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Site Summaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{site.name}</h3>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    site.health_percentage === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {site.health_percentage.toFixed(1)}% Health
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status Distribution</span>
                    <span className="font-medium text-gray-900">{site.online_aps} / {site.total_aps} Online</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${site.health_percentage === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${site.health_percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">{site.online_aps} Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-600">{site.offline_aps} Offline</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">
                  View Site Details
                </button>
                <ArrowUpRight size={16} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
