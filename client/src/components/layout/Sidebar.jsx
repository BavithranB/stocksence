import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TrendingUp,
  BarChart3,
  RefreshCcw,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', to: '/products', icon: Package },
  { label: 'Inventory', to: '/inventory', icon: Warehouse },
  { label: 'Sales', to: '/sales', icon: TrendingUp },
  { label: 'Forecasting', to: '/forecasting', icon: BarChart3 },
  { label: 'Replenishment', to: '/replenishment', icon: RefreshCcw },
  { label: 'Alerts', to: '/alerts', icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={`sidebar-transition h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">SS</span>
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">STOCKSENSE</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white text-xs font-bold">SS</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {navItems.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
