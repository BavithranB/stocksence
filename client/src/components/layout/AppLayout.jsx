import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

// Map routes to breadcrumb labels
const routeLabels = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/sales': 'Sales',
  '/forecasting': 'Demand Forecasting',
  '/replenishment': 'Replenishment',
  '/alerts': 'Alerts',
  '/settings': 'Settings',
};

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const currentLabel = routeLabels[location.pathname] || '';
  const breadcrumbs = currentLabel ? ['STOCKSENSE', currentLabel] : ['STOCKSENSE'];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
