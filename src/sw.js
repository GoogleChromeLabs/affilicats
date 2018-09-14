const VERSION = 1536930842230;
const OFFLINE_CACHE = `offline_${VERSION}`;

const TIMEOUT = 5000;

const HOME_URL = 'https://tomayac.github.io/affilicats/index.html';

const OFFLINE_IMG_URL = './img/offline.svg';
const TIMEOUT_IMG_URL = './img/timeout.svg';
const MANIFEST_URL = './manifest.webmanifest';
const STATIC_FILES = [
  './index.html',
  './forward.html',
  './js/main.js',
  './js/forward.js',
  './img/cat.png',
  './img/map.svg',
  MANIFEST_URL,
  OFFLINE_IMG_URL,
  TIMEOUT_IMG_URL,
];

self.addEventListener('install', (installEvent) => {
  self.skipWaiting();
  installEvent.waitUntil((async () => {
    const offlineCache = await caches.open(OFFLINE_CACHE);
    await offlineCache.addAll(STATIC_FILES);
    // Synthetic timeout responses
    await offlineCache.put('https://commons.wikimedia.org/timeout',
        new Response(JSON.stringify({
          query: {
            pages: {
              '1': {
                'imageinfo': [{
                  'thumburl': TIMEOUT_IMG_URL,
                  'thumbwidth': 15,
                  'thumbheight': 15,
                  'descriptionshorturl': '#',
                  'extmetadata': {
                    'ImageDescription': {
                      'value': 'Results took too long to load…',
                    },
                  },
                }],
              },
            },
          },
        }), {headers: {'content-type': 'application/json'}}));
    await offlineCache.put('https://www.random.org/timeout', new Response(
        'Offers timed out while loading\n',
        {headers: {'content-type': 'text/plain'}}));
    await offlineCache.put('https://baconipsum.com/timeout', new Response(
        JSON.stringify(['Review took too long to load…']),
        {headers: {'content-type': 'application/json'}}));
    // Synthetic offline responses
    await offlineCache.put('https://commons.wikimedia.org/offline',
        new Response(JSON.stringify({
          query: {
            pages: {
              '1': {
                'imageinfo': [{
                  'thumburl': OFFLINE_IMG_URL,
                  'thumbwidth': 15,
                  'thumbheight': 15,
                  'descriptionshorturl': '#',
                  'extmetadata': {
                    'ImageDescription': {
                      'value': 'Can\'t search while offline…',
                    },
                  },
                }],
              },
            },
          },
        }), {headers: {'content-type': 'application/json'}}));
    await offlineCache.put('https://www.random.org/offline', new Response(
        'Offers can\'t be loaded while offline\n',
        {headers: {'content-type': 'text/plain'}}));
    await offlineCache.put('https://baconipsum.com/offline', new Response(
        JSON.stringify(['Review can\'t be loaded while offline…']),
        {headers: {'content-type': 'application/json'}}));
    return;
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
  // Fail early
  if ((!fetchEvent.request.url.startsWith('http')) ||
      (fetchEvent.request.method !== 'GET')) {
    return;
  }

  // Strategy 1: cache, falling back to network (i.e., strategy 2)
  const cacheWithNetworkFallback = async (request, matchOpt = {},
    fetchOpt = {}) => {
    const cache = await caches.open(OFFLINE_CACHE);
    const match = await cache.match(request, matchOpt);
    return match || networkWithTimeout(request, '', new URL(request.url));
  };

  // Strategy 2: network, falling back to timeout content
  const networkWithTimeout = async (request, destination, url) => {
    // Race the timeout promise…
    const timeoutPromise = new Promise((resolve) => setTimeout(async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      if (destination === 'image') {
        return resolve(cache.match(TIMEOUT_IMG_URL));
      }
      if (destination === 'manifest') {
        return resolve(cache.match(MANIFEST_URL));
      }
      if (!destination) {
        if ((url.origin === 'https://commons.wikimedia.org') ||
            (url.origin === 'https://www.random.org') ||
            (url.origin === 'https://baconipsum.com')) {
          return resolve(cache.match(`${url.origin}/timeout`,
              {ignoreSearch: true}));
        }
        if (url.origin === 'https://placekitten.com') {
          return resolve(cache.match(TIMEOUT_IMG_URL));
        }
      }
      return resolve(cache.match(request));
    }, TIMEOUT));
    // …against the network promise
    const fetchPromise = (async () => {
      try {
        const response = await fetch(request);
        if ((url.origin === location.origin) && !response.ok) {
          throw new TypeError(`Could not load ${request.url}`);
        }
        return response;
      } catch (e) {
        const cache = await caches.open(OFFLINE_CACHE);
        if (destination === 'image') {
          return cache.match(OFFLINE_IMG_URL);
        }
        if (destination === 'manifest') {
          return cache.match(MANIFEST_URL);
        }
        if (!destination) {
          if ((url.origin === 'https://commons.wikimedia.org') ||
              (url.origin === 'https://www.random.org') ||
              (url.origin === 'https://baconipsum.com')) {
            return cache.match(`${url.origin}/offline`);
          }
          if (url.origin === 'https://placekitten.com') {
            return cache.match(OFFLINE_IMG_URL);
          }
        }
        // This should never happen, but just in case
        console.warn('Unhandled offline case', e);
        return new Response();
      };
    })();
    // Start the race
    return Promise.race([
      timeoutPromise,
      fetchPromise,
    ]);
  };

  // The actual handler
  fetchEvent.respondWith((async () => {
    const request = fetchEvent.request;
    const url = new URL(request.url);
    // Deal with navigational requests
    if (request.mode === 'navigate') {
      // The root `/` is actually cached as `/index.html`
      if (url.pathname.endsWith('/')) {
        const rewrittenURL =
            `${url.origin}${url.pathname}index.html${url.search}${url.hash}`;
        return cacheWithNetworkFallback(new Request(rewrittenURL),
            {ignoreSearch: true});
      }
      // Any other resource
      return cacheWithNetworkFallback(request, {ignoreSearch: true});
    }
    // Deal with non-navigational requests
    const destination = request.destination;
    if (destination) {
      // Deal with scripts
      if (destination === 'script') {
        // Deal with polyfills
        if (url.origin === 'https://unpkg.com') {
          return cacheWithNetworkFallback(request, {}, {mode: 'no-cors'});
        }
        // Deal with local scripts
        return cacheWithNetworkFallback(request);
      }
      // Deal with images
      if (destination === 'image') {
        if (STATIC_FILES.includes(request.url)) {
          return cacheWithNetworkFallback(request);
        }
        return networkWithTimeout(request, destination, url);
      }
    }
    // Deal with polyfills
    if (url.origin === 'https://unpkg.com') {
      return cacheWithNetworkFallback(request, {}, {mode: 'no-cors'});
    }
    // Deal with everything else
    return networkWithTimeout(request, destination, url);
  })());
});

self.addEventListener('push', (pushEvent) => {
  pushEvent.waitUntil(
      self.registration.showNotification('🐈 AffiliCats Price Drop Alert 🚨', {
        body: 'Prices for cats are going down! 📉',
        icon: './img/cat.png',
      })
  );
});

self.addEventListener('notificationclick', async (clickEvent) => {
  clickEvent.waitUntil((async () => {
    clickEvent.notification.close();
    const clientList = await clients.matchAll({type: 'window'});
    for (const client of clientList) {
      if (client.url === HOME_URL && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(HOME_URL);
    }
  })());
});
