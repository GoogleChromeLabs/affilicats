const VERSION = 1536849828901;
const OFFLINE_CACHE = `offline_${VERSION}`;

const TIMEOUT = 5000;

const HOME_URL = 'https://tomayac.github.io/affilicats/index.html';

const OFFLINE_IMG_URL = './img/offline.svg';
const TIMEOUT_IMG_URL = './img/timeout.svg';
const STATIC_FILES = [
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

self.addEventListener('install', (installEvent) => {
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
  if ((!fetchEvent.request.url.startsWith('http')) ||
      (fetchEvent.request.method !== 'GET')) {
    return;
  }

  const cacheWithNetworkFallback =
      async (requestOrURL, matchOpt = {}, fetchOpt = {}) => {
        const cache = await caches.open(OFFLINE_CACHE);
        const match = await cache.match(requestOrURL, matchOpt);
        return match || fetch(requestOrURL, fetchOpt);
      };

  const networkWithTimeout = async (request, destination, url) => {
    const waitPromise = new Promise((resolve) => setTimeout(() => {
      if (destination === 'image') {
        return resolve(cacheWithNetworkFallback(TIMEOUT_IMG_URL));
      }
      if (!destination) {
        if (url.origin === 'https://commons.wikimedia.org') {
          const blob = new Blob(
              [JSON.stringify({
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
              })],
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
          return resolve(cacheWithNetworkFallback(TIMEOUT_IMG_URL));
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
            return cacheWithNetworkFallback(OFFLINE_IMG_URL);
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
              return cacheWithNetworkFallback(OFFLINE_IMG_URL);
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
      if (/\/$/.test(request.url)) {
        return cacheWithNetworkFallback(`${request.url}index.html`,
            {ignoreSearch: true});
      }
      return cacheWithNetworkFallback(request, {ignoreSearch: true});
    }
    const destination = request.destination;
    const url = new URL(request.url);
    if (destination) {
      if (destination === 'script') {
        if (url.origin === 'https://unpkg.com') {
          return cacheWithNetworkFallback(request, {}, {mode: 'no-cors'});
        }
        return cacheWithNetworkFallback(request);
      }
      if (destination === 'image') {
        if (STATIC_FILES.includes(request.url)) {
          return cacheWithNetworkFallback(request);
        }
        return networkWithTimeout(request, destination, url);
      }
    }
    if (url.origin === 'https://unpkg.com') {
      return cacheWithNetworkFallback(request, {}, {mode: 'no-cors'});
    }
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
