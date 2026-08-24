import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BusinessHub - Smart POS & Retail Management',
    short_name: 'BusinessHub',
    description: 'All-in-one Smart POS, Real-Time Inventory, Expense Tracking & Retail Operations Platform',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#f5fbf3',
    theme_color: '#006b3f',
    orientation: 'any',
    categories: ['business', 'finance', 'productivity', 'shopping'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Point of Sale (POS)',
        short_name: 'POS',
        description: 'Open quick checkout POS terminal',
        url: '/pos',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Live Inventory',
        short_name: 'Inventory',
        description: 'View products and stock levels',
        url: '/inventory',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Sales Dashboard',
        short_name: 'Dashboard',
        description: 'View real-time revenue and reports',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
