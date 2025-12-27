import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Toaster } from 'sonner';
import AppUpdateNotification from '@/components/app-update-notification';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEI Smart Hostel',
  description: 'NEI Smart Hostel - Hostel Management System',
  manifest: '/manifest.json',
  themeColor: '#8b5cf6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NEI Smart Hostel',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
        <AppUpdateNotification />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then((registration) => {
                      console.log('[PWA] Service Worker registered successfully:', registration.scope);
                      
                      // Check for updates on page load
                      registration.update();
                      
                      // Check for updates every 30 minutes
                      setInterval(() => {
                        registration.update();
                      }, 1800000);
                      
                      // Handle service worker updates
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('[PWA] New service worker available, will update on next visit');
                            }
                          });
                        }
                      });
                    })
                    .catch((error) => {
                      console.error('[PWA] Service Worker registration failed:', error);
                    });
                });
              } else {
                console.warn('[PWA] Service Workers are not supported in this browser');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
