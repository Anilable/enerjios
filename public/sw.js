// Service Worker for Trakya Solar PWA
const CACHE_NAME = 'trakya-solar-v2';
const DYNAMIC_CACHE = 'trakya-solar-dynamic-v2';
const API_CACHE = 'trakya-solar-api-v2';
const IMAGE_CACHE = 'trakya-solar-images-v2';

// Core assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png',
  '/_next/static/css/',
  '/_next/static/js/'
];

// API endpoints to cache for offline access
const CACHEABLE_APIS = [
  '/api/dashboard/overview',
  '/api/projects',
  '/api/customers',
  '/api/quotes',
  '/api/notifications'
];

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  [DYNAMIC_CACHE]: 50,
  [API_CACHE]: 30,
  [IMAGE_CACHE]: 100
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.error('[SW] Error caching static assets:', err))
  );
  
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              const currentCaches = [CACHE_NAME, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE];
              return !currentCaches.includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Set up periodic sync for dashboard updates
      self.registration.periodicSync?.register('update-dashboard', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      }).catch(err => console.log('[SW] Periodic sync not supported:', err))
    ])
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http(s) requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle API calls with smart caching
  if (url.pathname.startsWith('/api/')) {
    if (isReadOnlyAPI(url.pathname)) {
      event.respondWith(staleWhileRevalidate(request, API_CACHE));
    } else {
      event.respondWith(networkFirst(request, API_CACHE));
    }
    return;
  }

  // Handle images (cache first with size limits)
  if (isImageAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Handle static assets (cache first)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Handle navigation requests (network first with offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, DYNAMIC_CACHE)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Default strategy (stale while revalidate)
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Cache-first strategy
async function cacheFirst(request, cacheName = DYNAMIC_CACHE) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await limitCacheSize(cacheName, MAX_CACHE_SIZE[cacheName]);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await limitCacheSize(cacheName, MAX_CACHE_SIZE[cacheName]);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch fresh data in the background
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await limitCacheSize(cacheName, MAX_CACHE_SIZE[cacheName]);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.error('[SW] Background fetch failed:', error);
    return cachedResponse;
  });

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Limit cache size to prevent storage quota issues
async function limitCacheSize(cacheName, maxSize) {
  if (!maxSize) return;
  
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length >= maxSize) {
    // Delete oldest entries
    const toDelete = keys.slice(0, keys.length - maxSize + 1);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

// Check if the path is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.startsWith('/_next/static/');
}

// Check if the path is an image asset
function isImageAsset(pathname) {
  const imageExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'
  ];
  
  return imageExtensions.some(ext => pathname.endsWith(ext));
}

// Check if API endpoint is read-only (can be cached longer)
function isReadOnlyAPI(pathname) {
  const readOnlyPatterns = [
    '/api/dashboard/overview',
    '/api/analytics',
    '/api/reports',
    '/api/products'
  ];
  
  return readOnlyPatterns.some(pattern => pathname.startsWith(pattern));
}

// Enhanced offline storage for form data
async function storeOfflineData(type, data) {
  const cache = await caches.open(`offline-${type}`);
  const request = new Request(`/offline/${type}/${Date.now()}`);
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  await cache.put(request, response);
  console.log(`[SW] Stored offline ${type} data`);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered');
  
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncQuotes());
  }
  
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects());
  }
});

// Sync quotes when back online
async function syncQuotes() {
  try {
    const cache = await caches.open('offline-quotes');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const cachedResponse = await cache.match(request);
      const data = await cachedResponse.json();
      
      // Send to server
      await fetch('/api/quotes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Remove from offline cache
      await cache.delete(request);
    }
  } catch (error) {
    console.error('[SW] Error syncing quotes:', error);
  }
}

// Sync projects when back online
async function syncProjects() {
  try {
    const cache = await caches.open('offline-projects');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const cachedResponse = await cache.match(request);
      const data = await cachedResponse.json();
      
      // Send to server
      await fetch('/api/projects/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Remove from offline cache
      await cache.delete(request);
    }
  } catch (error) {
    console.error('[SW] Error syncing projects:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notification = {
    title: 'Trakya Solar',
    body: 'Yeni bir bildiriminiz var',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notification = { ...notification, ...data };
    } catch (e) {
      notification.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      vibrate: notification.vibrate,
      data: notification.data,
      actions: [
        {
          action: 'view',
          title: 'Görüntüle'
        },
        {
          action: 'dismiss',
          title: 'Kapat'
        }
      ]
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if app is already open
        for (const client of windowClients) {
          if (client.url.includes('trakyasolar.com') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if not already open
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/dashboard';
          return clients.openWindow(url);
        }
      })
  );
});

// Periodic background sync for real-time updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-dashboard') {
    event.waitUntil(updateDashboardData());
  }
});

async function updateDashboardData() {
  try {
    const response = await fetch('/api/dashboard/updates');
    const data = await response.json();
    
    // Send message to all clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'dashboard-update',
        data: data
      });
    });
  } catch (error) {
    console.error('[SW] Error updating dashboard:', error);
  }
}

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'skip-waiting') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'cache-update') {
    event.waitUntil(updateCache(event.data.urls));
  }
});

async function updateCache(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
}

console.log('[SW] Service worker loaded');