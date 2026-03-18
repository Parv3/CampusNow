// 1. Every time you change your HTML/JS, change this version number (v1 -> v2)
const CACHE_NAME = "campusnow-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Install: Cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Using relative paths (./) is safer for GitHub Pages
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Force the new service worker to become active immediately
});

// Activate: Clean up old versions of the cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch: NETWORK-FIRST strategy
// This tries to get the latest file from the web first. 
// If offline, it falls back to the cache.
self.addEventListener("fetch", event => {
  // Skip cross-origin requests (like Firebase SDK or Google Fonts)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update the cache with the new version we just fetched
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request)) // If offline, use cache
  );
});
