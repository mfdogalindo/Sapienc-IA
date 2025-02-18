// app/components/RoutePreloader.tsx
import { useEffect } from 'react';
import { useFetcher, useLocation } from '@remix-run/react';

const routes = ['/projects', '/todos', '/clipboard', '/fileManager'];

export function RoutePreloader() {
  const location = useLocation();
  const fetcher = useFetcher();

  useEffect(() => {
    // Preload all routes except current one
    routes.forEach(route => {
      if (route !== location.pathname) {
        fetcher.load(route);
      }
    });
  }, [location.pathname]);

  return null;
}