const VERSION = 1536562494719;
const OFFLINE_CACHE = `offline_${VERSION}`;

const TIMEOUT = 5000;

const OFFLINE_IMG_URL = './img/offline.svg';
const TIMEOUT_IMG_URL = './img/timeout.svg';
const STATIC_FILES = [
  './',
  './index.html',
  './forward.html',
  './manifest.webmanifest',
  './js/main.js',
  './js/forward.js',
  './img/cat.png',
  './img/map.svg',
  OFFLINE_IMG_URL,
  TIMEOUT_IMG_URL,
];

self.addEventListener('install', async (installEvent) => {
  self.skipWaiting();
  installEvent.waitUntil((async () => {
    const cache = await caches.open(OFFLINE_CACHE);
    return cache.addAll(STATIC_FILES);
  })());
});

self.addEventListener('activate', (activateEvent) => {
  activateEvent.waitUntil((async () => {
    const keys = await caches.keys();
    return Promise.all(keys.map((key) => {
      if (key !== OFFLINE_CACHE) {
        return caches.delete(key);
      }
    }))
        .then(() => self.clients.claim());
  })());
});

self.addEventListener('fetch', (fetchEvent) => {
  const cacheOnly = async (request, options = {}) => {
    const cache = await caches.open(OFFLINE_CACHE);
    return cache.match(request, options);
  };

  const networkWithTimeout = async (request, destination, url) => {
    const waitPromise = new Promise((resolve) => setTimeout(() => {
      if (destination === 'image') {
        return resolve(cacheOnly(TIMEOUT_IMG_URL));
      }
      if (!destination) {
        if (url.origin === 'https://commons.wikimedia.org') {
          const blob = new Blob(
              [JSON.stringify({query: {pages: {}}})],
              {type: 'application/json'});
          return resolve(new Response(blob));
        }
        if (url.origin === 'https://www.random.org') {
          const blob = new Blob(
              ['Offers timed out while loading\n'],
              {type: 'text/plain'});
          return resolve(new Response(blob));
        }
        if (url.origin === 'https://baconipsum.com') {
          const blob = new Blob(
              [JSON.stringify(['Reviews took too long to load…'])],
              {type: 'application/json'});
          return resolve(new Response(blob));
        }
        if (url.origin === 'https://placekitten.com') {
          return resolve(cacheOnly(TIMEOUT_IMG_URL));
        }
      }
    }, TIMEOUT));

    const sameOrigin = url.origin === location.origin;
    const fetchPromise = fetch(request)
        .then((response) => {
          if (sameOrigin && !response.ok) {
            throw new TypeError(`Could not load ${request.url}`);
          }
          return response;
        })
        .catch((e) => {
          if (destination === 'image') {
            return cacheOnly(OFFLINE_IMG_URL);
          }
          if (!destination) {
            if (url.origin === 'https://commons.wikimedia.org') {
              const blob = new Blob(
                  [JSON.stringify({query: {pages: {}}})],
                  {type: 'application/json'});
              return new Response(blob);
            }
            if (url.origin === 'https://www.random.org') {
              const blob = new Blob(
                  ['Offers can\'t be loaded while offline\n'],
                  {type: 'text/plain'});
              return new Response(blob);
            }
            if (url.origin === 'https://baconipsum.com') {
              const blob = new Blob(
                  [JSON.stringify(['Reviews can\'t be loaded while offline…'])],
                  {type: 'application/json'});
              return new Response(blob);
            }
            if (url.origin === 'https://placekitten.com') {
              return cacheOnly(OFFLINE_IMG_URL);
            }
          }
          return new Response();
        });
    return Promise.race([
      waitPromise,
      fetchPromise,
    ]);
  };

  fetchEvent.respondWith((async () => {
    const request = fetchEvent.request;
    if (request.mode === 'navigate') {
      return cacheOnly(request, {ignoreSearch: true});
    }
    const destination = request.destination;
    const url = new URL(request.url);
    if (url.protocol === 'chrome-extension:') {
      return new Response();
    }
    if (destination) {
      if (destination === 'script') {
        return cacheOnly(request);
      }
      if (destination === 'image') {
        if (STATIC_FILES.includes(request.url)) {
          return cacheOnly(request);
        }
        return networkWithTimeout(request, destination, url);
      }
    }
    return networkWithTimeout(request, destination, url);
  })());
});
