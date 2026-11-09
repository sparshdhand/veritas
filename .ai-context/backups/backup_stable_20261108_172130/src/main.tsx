import {createRoot} from 'react-dom/client';
import 'katex/dist/katex.min.css';
import App from './App.tsx';
import './index.css';

// PWA Service Worker Registration with Seamless Auto-Update (No hard refresh needed)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Check for updates automatically whenever user returns or views the app
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Tell new worker to skip waiting and claim clients
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

        // Periodic background update check every 15 minutes
        setInterval(() => {
          reg.update().catch(() => {});
        }, 15 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('PWA ServiceWorker registration failed:', err);
      });

    // Auto-reload seamlessly once when a new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
