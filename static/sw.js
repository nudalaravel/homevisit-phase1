const options = {"workboxURL":"https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.4/workbox/workbox-sw.js","importScripts":[],"config":{"debug":true},"cacheOptions":{"cacheId":"riper-v2-app-dev","directoryIndex":"/","revision":"G25OmAh6P40a"},"clientsClaim":true,"skipWaiting":true,"cleanupOutdatedCaches":true,"offlineAnalytics":false,"preCaching":[{"revision":"G25OmAh6P40a","url":"/homevisit/"}],"runtimeCaching":[{"urlPattern":"^https://ripedresearch.org/.*","handler":"NetworkFirst","method":"GET","strategyOptions":{"cacheName":"api-cache","networkTimeoutSeconds":10,"cacheableResponse":{"statuses":[0,200]},"expiration":{"maxEntries":50,"maxAgeSeconds":31536000}},"strategyPlugins":[]},{"urlPattern":{},"handler":"CacheFirst","strategyOptions":{"cacheName":"image-cache","cacheableResponse":{"statuses":[0,200]},"expiration":{"maxEntries":100,"maxAgeSeconds":31536000}},"method":"GET","strategyPlugins":[]},{"urlPattern":{},"handler":"StaleWhileRevalidate","strategyOptions":{"cacheName":"s3-image-cache","cacheableResponse":{"statuses":[0,200]},"expiration":{"maxEntries":200,"maxAgeSeconds":604800,"purgeOnQuotaError":true}},"method":"GET","strategyPlugins":[]},{"urlPattern":"/homevisit/_nuxt/","handler":"NetworkFirst","method":"GET","strategyPlugins":[]},{"urlPattern":"/homevisit/","handler":"NetworkFirst","method":"GET","strategyPlugins":[]}],"offlinePage":null,"pagesURLPattern":"/homevisit/","offlineStrategy":"NetworkFirst"}

importScripts(...[options.workboxURL, ...options.importScripts])

initWorkbox(workbox, options)
workboxExtensions(workbox, options)
precacheAssets(workbox, options)
cachingExtensions(workbox, options)
runtimeCaching(workbox, options)
offlinePage(workbox, options)
routingExtensions(workbox, options)

function getProp(obj, prop) {
  return prop.split('.').reduce((p, c) => p[c], obj)
}

function initWorkbox(workbox, options) {
  if (options.config) {
    // Set workbox config
    workbox.setConfig(options.config)
  }

  if (options.cacheNames) {
    // Set workbox cache names
    workbox.core.setCacheNameDetails(options.cacheNames)
  }

  if (options.clientsClaim) {
    // Start controlling any existing clients as soon as it activates
    workbox.core.clientsClaim()
  }

  if (options.skipWaiting) {
    workbox.core.skipWaiting()
  }

  if (options.cleanupOutdatedCaches) {
    workbox.precaching.cleanupOutdatedCaches()
  }

  if (options.offlineAnalytics) {
    // Enable offline Google Analytics tracking
    workbox.googleAnalytics.initialize()
  }
}

function precacheAssets(workbox, options) {
  if (options.preCaching.length) {
    workbox.precaching.precacheAndRoute(options.preCaching, options.cacheOptions)
  }
}


function runtimeCaching(workbox, options) {
  const requestInterceptor = {
    requestWillFetch({ request }) {
      if (request.cache === 'only-if-cached' && request.mode === 'no-cors') {
        return new Request(request.url, { ...request, cache: 'default', mode: 'no-cors' })
      }
      return request
    },
    fetchDidFail(ctx) {
      ctx.error.message =
        '[workbox] Network request for ' + ctx.request.url + ' threw an error: ' + ctx.error.message
      console.error(ctx.error, 'Details:', ctx)
    },
    handlerDidError(ctx) {
      ctx.error.message =
        `[workbox] Network handler threw an error: ` + ctx.error.message
      console.error(ctx.error, 'Details:', ctx)
      return null
    }
  }

  for (const entry of options.runtimeCaching) {
    const urlPattern = new RegExp(entry.urlPattern)
    const method = entry.method || 'GET'

    const plugins = (entry.strategyPlugins || [])
      .map(p => new (getProp(workbox, p.use))(...p.config))

    plugins.unshift(requestInterceptor)

    const strategyOptions = { ...entry.strategyOptions, plugins }

    const strategy = new workbox.strategies[entry.handler](strategyOptions)

    workbox.routing.registerRoute(urlPattern, strategy, method)
  }
}

function offlinePage(workbox, options) {
  if (options.offlinePage) {
    // Register router handler for offlinePage
    workbox.routing.registerRoute(new RegExp(options.pagesURLPattern), ({ request, event }) => {
      const strategy = new workbox.strategies[options.offlineStrategy]
      return strategy
        .handle({ request, event })
        .catch(() => caches.match(options.offlinePage))
    })
  }
}

function workboxExtensions(workbox, options) {
  
}

function cachingExtensions(workbox, options) {
  
}

function routingExtensions(workbox, options) {
  
}

// Background Sync configuration
const SYNC_TAG_NAME = 'riped-sync-queue';
const IDB_NAME = 'HomeVisitApp';
const IDB_VERSION = 2;
const SYNC_QUEUE_STORE = 'syncQueue';

// Helper function to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
      }
    };
  });
}

// Helper function to get all items from sync queue
async function getSyncQueueItems() {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Helper function to remove item from sync queue
async function removeSyncQueueItem(itemId) {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.delete(itemId);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper function to update item in sync queue
async function updateSyncQueueItem(item) {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.put(item);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Function to sync a single item
async function syncItem(item) {
  const { action, data } = item;
  const baseURL = 'https://ripedresearch.org';
  
  let url, options;
  
  switch (action) {
    case 'CREATE_VISIT':
      url = `${baseURL}/api/visits`;
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
      break;
      
    case 'UPDATE_VISIT':
      url = `${baseURL}/api/visits/${data.id}`;
      options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
      break;
      
    case 'CREATE_PATIENT':
      url = `${baseURL}/api/patients`;
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
      break;
      
    case 'UPDATE_PATIENT':
      url = `${baseURL}/api/patients/${data.id}`;
      options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      };
      break;
      
    case 'UPLOAD_IMAGE':
      url = `${baseURL}/api/upload`;
      const formData = new FormData();
      formData.append('file', data.file);
      options = {
        method: 'POST',
        body: formData,
      };
      break;
      
    default:
      throw new Error(`Unknown sync action: ${action}`);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Process sync queue
async function processSyncQueue() {
  console.log('[SW] Processing sync queue...');
  
  try {
    const items = await getSyncQueueItems();
    console.log(`[SW] Found ${items.length} items in sync queue`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of items) {
      try {
        console.log(`[SW] Syncing item ${item.id}...`);
        await syncItem(item);
        await removeSyncQueueItem(item.id);
        successCount++;
        console.log(`[SW] Successfully synced item ${item.id}`);
      } catch (error) {
        console.error(`[SW] Failed to sync item ${item.id}:`, error);
        
        // Update retry count
        item.retries = (item.retries || 0) + 1;
        item.lastRetryAt = new Date().toISOString();
        item.lastError = error.message || 'Unknown error';
        
        // If max retries reached, move to failed queue
        if (item.retries >= 10) {
          item.status = 'failed';
          item.failedAt = new Date().toISOString();
          // Note: Failed items will be handled by the main app
        } else {
          await updateSyncQueueItem(item);
        }
        
        failCount++;
      }
    }
    
    console.log(`[SW] Sync complete: ${successCount} succeeded, ${failCount} failed`);
    
    // If there are still items in the queue, register for another sync
    const remainingItems = await getSyncQueueItems();
    if (remainingItems.length > 0) {
      console.log(`[SW] ${remainingItems.length} items remaining, will retry later`);
      // The browser will automatically retry
      throw new Error('Some items failed to sync');
    }
    
    return { successCount, failCount };
  } catch (error) {
    console.error('[SW] Sync queue processing error:', error);
    throw error;
  }
}

// Listen for Background Sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event received:', event.tag);
  
  if (event.tag === SYNC_TAG_NAME) {
    event.waitUntil(processSyncQueue());
  }
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    // Trigger sync immediately
    processSyncQueue()
      .then(() => {
        // Notify the client that sync is complete
        event.ports[0].postMessage({ success: true });
      })
      .catch((error) => {
        console.error('[SW] Sync failed:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
