import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { 
  LayoutDashboard, 
  Settings, 
  Network, 
  ShieldCheck, 
  LogOut,
  Activity
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = authService.isAdmin();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Sites & Zones', path: '/sites', icon: Network },
    { name: 'VPN Profiles', path: '/vpns', icon: ShieldCheck },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Settings', path: '/settings', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-vod-dark text-white flex flex-col">
        <div className="p-6 flex flex-col border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-black tracking-tighter">VOD</span>
            <div className="flex flex-col border-l border-vod-yellow pl-1.5">
              <span className="text-vod-yellow text-[8px] font-black uppercase leading-none">Group</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-vod-yellow">
            <Activity size={18} />
            <span className="text-lg font-bold tracking-tight">PulseAP</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                ? 'bg-vod-yellow text-vod-dark font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find(item => item.path === location.pathname)?.name || 'PulseAP'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
