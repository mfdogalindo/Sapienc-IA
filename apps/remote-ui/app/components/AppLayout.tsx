// app/components/AppLayout.tsx
import { useLocation } from '@remix-run/react';
import Toolbar from './Toolbar';
import { RoutePreloader } from './RoutePreloader';
import { Suspense } from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <>
      <RoutePreloader />
      <Toolbar />
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }
      >
        <div key={location.pathname} className="app-container">
          {children}
        </div>
      </Suspense>
    </>
  );
}