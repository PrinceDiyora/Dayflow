import { Outlet } from 'react-router-dom';
import { Topbar } from './topbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
