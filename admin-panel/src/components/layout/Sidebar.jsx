import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  BarChart3, 
  Brain, 
  Settings,
  Phone
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/stores', icon: Store, label: 'Locales' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/learning', icon: Brain, label: 'Aprendizaje' },
  { path: '/settings', icon: Settings, label: 'Configuración' }
];

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Phone className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="text-xl font-bold">Call Center</h1>
            <p className="text-xs text-gray-400">Premium IA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white border-r-4 border-primary-400'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer - SIN LÍNEA NEGRA */}
      <div className="p-6">
        <div className="text-xs text-gray-500">
          <p>Sistema activo</p>
          <p className="text-green-500 font-medium mt-1">● En línea</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;