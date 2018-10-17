/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(() => {
  const DEFAULT_SEARCH = 'Felis silvestris catus';
  const INSTALL_THRESHOLD = 2;
  // eslint-disable-next-line max-len
  const VAPID_PUBLIC_KEY = 'BHuCD9Ym4yXI9Fk0KHrRcPgH2iQOXhoWbzWtm4GQocD1zGYz4IXyazINE_-T4pEojrAgqoGoRnxUgX5CAuguRGo';

  const offline = document.querySelector('.offline');
  const main = document.querySelector('main');
  const search = document.querySelector('input[type="search"]');
  const button = document.querySelector('button[type="submit"]');
  const template = document.getElementById('cat');
  const install = document.querySelector('.install');

  let installPromptEvent;
  let registration;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        const target = entry.target;
        observer.unobserve(target);
        // Lazy-load image
        if (target.nodeName === 'IMG') {
          // Cache-bust so the browser doesn't use a cached fallback image
          return target.src = `${target.dataset.src}${
              /\?/.test(target.dataset.src) ? '&' : '?'}${
            Math.random().toString().substr(2)}`;
        }
        const classList = target.classList;
        // Lazy-load photos
        if (classList.contains('photos')) {
          return loadPhotos(target);
        }
        // Lazy-load reviews
        if (classList.contains('reviews')) {
          return loadReviews(target);
        }
        // Lazy-load offers
        if (classList.contains('offers')) {
          return loadOffers(target);
        }
      }
    });
  });

  const getCats = async (query) => {
    const url = `https://commons.wikimedia.org/w/api.php
        ?action=query
        &generator=categorymembers
        &gcmlimit=max
        &gcmtype=file
        &gcmtitle=Category:${encodeURIComponent(query.replace(/\s/g, ' '))}
        &prop=imageinfo
        &iiurlwidth=500
        &iiprop=extmetadata|url
        &iiextmetadatafilter=ImageDescription
        &format=json&origin=*`.replace(/\n\s*/g, '');
    return fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new TypeError(`Could not load ${url}`);
          }
          return response.json();
        })
        .then((data) => {
          if (!data || !data.query || !data.query.pages) {
            return;
          }
          return Object.keys(data.query.pages).map((key) => {
            let entry = data.query.pages[key];
            try {
              entry = entry.imageinfo[0];
              const src = entry.thumburl;
              const url = entry.descriptionshorturl;
              const width = entry.thumbwidth;
              const height = entry.thumbheight;
              const description = entry.extmetadata.ImageDescription.value;
              return {url, src, description, width, height};
            } catch (e) {
              return;
            }
          }).filter((item) => typeof item !== 'undefined');
        })
        .catch((e) => console.error(e));
  };

  const renderCats = (data, template, main) => {
    const pushSupported = registration && 'pushManager' in registration;
    const fragment = document.createDocumentFragment();
    data.forEach((cat, index) => {
      const catContainer = document.importNode(template.content, true);
      // Image
      const img = catContainer.querySelector('figure img');
      img.alt = `Illustrative ${search.value.toLowerCase()} image`;
      img.classList.add('lazyload');
      img.dataset.src = cat.src;
      // Description
      const figcaption = catContainer.querySelector('figcaption');
      figcaption.textContent =
          (figcaption.innerHTML = cat.description, figcaption.textContent);
      // Metadata
      const priceDrop = catContainer.querySelector('.pricedrop');
      if (pushSupported) {
        priceDrop.addEventListener('click', () => {
          priceDrop.innerHTML = priceDrop.innerHTML.replace('🛎', '⏳');
          (async () => {
            const pushSucceeded = await pushNotifications();
            if (pushSucceeded) {
              priceDrop.disabled = true;
              priceDrop.dataset.active = 'false';
              priceDrop.innerHTML = priceDrop.innerHTML.replace('⏳', '✅');
            } else {
              priceDrop.innerHTML = priceDrop.innerHTML.replace('⏳', '🛎');
            }
          })();
        });
        priceDrop.hidden = false;
      } else {
        priceDrop.hidden = true;
      }
      const cuteness = catContainer.querySelector('.cuteness');
      cuteness.textContent = `${'😻'.repeat(Math.floor(
          Math.random() * 5) + 1)}`;
      const price = catContainer.querySelector('.price');
      price.textContent = `${'💰'.repeat(Math.floor(
          Math.random() * 3) + 1)}`;
      // Outlink
      const outlink = catContainer.querySelector('.outlink');
      const outclickURL = `./forward.html?url=${encodeURIComponent(cat.url)}`;
      outlink.dataset.href = outclickURL;
      catContainer.querySelector('.offers').dataset.outclickURL = outclickURL;
      outlink.textContent = '📦 View Deal';
      outlink.addEventListener('click', (e) => {
        let previouslyEngaged = localStorage.getItem('engagement');
        if (!previouslyEngaged) {
          localStorage.setItem('engagement', 1);
        } else {
          previouslyEngaged = parseInt(previouslyEngaged, 10);
          if ((!isNaN(previouslyEngaged)) &&
              (previouslyEngaged < INSTALL_THRESHOLD)) {
            localStorage.setItem('engagement', ++previouslyEngaged);
          }
        }
        document.location.href = outlink.dataset.href;
      });
      // Tabs
      const tabs = catContainer.querySelector('.tabs');
      tabs.addEventListener('click', () => {
        lazyLoadInit(tabs);
      });
      const labels = tabs.querySelectorAll('.tab label');
      const tabContents = tabs.querySelectorAll('.tabcontent');
      tabs.querySelectorAll('.tab input').forEach((input, i) => {
        const id = Math.random().toString().substr(2);
        input.name = `tabgroup${index}`;
        input.id = id;
        labels[i].setAttribute('for', id);
        tabContents[i].setAttribute('aria-labelledby', id);
      });
      // Map
      const map = tabs.querySelector('.map');
      const lat = Math.round((Math.random() < 0.5 ? -1 : 1) *
          Math.random() * 90 * 100000) / 100000;
      const long = Math.round((Math.random() < 0.5 ? -1 : 1) *
          Math.random() * 180 * 100000) / 100000;
      map.dataset.src = `https://maps.googleapis.com/maps/api/staticmap
          ?autoscale=1
          &size=500x350
          &maptype=terrain
          &key=AIzaSyBWZnCRi6oar3MTjR0HkR1lK52_mTe0Rks
          &format=png
          &markers=size:small%7Ccolor:0xfffb00%7C${lat},${long}`
          .replace(/\n\s*/g, '');
      map.alt = `Map centered on latitude ${lat} and longitude ${long}`;
      tabs.querySelector('.lat').textContent = lat;
      tabs.querySelector('.long').textContent = long;
      fragment.appendChild(catContainer);
    });
    main.innerHTML = '';
    main.appendChild(fragment);
  };

  const loadOffers = (offers) => {
    const outclickURL = offers.dataset.outclickURL;
    const fragment = document.createDocumentFragment();
    const url = `https://www.random.org/integers/
        ?num=${Math.floor(Math.random() * 4) + 2}
        &min=5&max=20&col=1&base=10&format=plain&rnd=new`.replace(/\n\s*/g, '');
    fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new TypeError(`Could not load ${url}`);
          }
          return response.text();
        })
        .then((text) => {
          let numbers = text.split(/\n/g);
          numbers.splice(-1, 1);
          numbers.map((text) => isNaN(parseInt(text, 10)) ?
          text : parseInt(text + '9', 10))
              .sort((a, b) => a - b)
              .map((number, index) => {
                const li = document.createElement('li');
                li.innerHTML = /\d+/.test(number) ?
                    `<sup>$</sup>
                    <span class="price">${number}</span> |
                    <a href="${outclickURL}">Affiliate ${index}</a>` :
                    number;
                fragment.appendChild(li);
              });
          offers.innerHTML = '';
          offers.appendChild(fragment);
        })
        .catch((e) => console.error(e));
  };

  const loadReviews = (target) => {
    const fragment = document.createDocumentFragment();
    const promises = [];
    for (let i = 0, lenI = Math.floor(Math.random() * 6) + 2; i < lenI; i++) {
      const url = `https://baconipsum.com/api/?type=all-meat&paras=${
        Math.floor(Math.random() * 3) + 1}&start-with-lorem=1&random=${i}`;
      promises[i] = fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new TypeError(`Could not load ${url}`);
            }
            return response.json();
          })
          .then((sentences) => `<li>${sentences.map(
              (sentence) => `<p>${sentence}</p>`).join('')}</li>`)
          .catch((e) => console.error(e));
    }
    Promise.all(promises)
        .then((reviews) => reviews.join(''))
        .then((reviews) => {
          const ul = document.createElement('ul');
          ul.innerHTML = reviews;
          fragment.appendChild(ul);
          target.innerHTML = '';
          target.appendChild(fragment);
        });
  };

  const loadPhotos = (target) => {
    const fragment = document.createDocumentFragment();
    const gallery = document.createElement('div');
    gallery.classList.add('gallery');
    fragment.appendChild(gallery);
    const promises = [];
    for (let i = 0, lenI = Math.floor(Math.random() * 15) + 2; i < lenI; i++) {
      const width = (Math.floor(Math.random() * 10) + 20) * 10;
      const height = (Math.floor(Math.random() * 5) + 20) * 10;
      const url = `https://placekitten.com/${width}/${height}?random=${i}`;
      promises[i] = fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new TypeError(`Could not load ${url}`);
            }
            return response.blob();
          })
          .then((blob) => {
            return {width, height, blob};
          });
    }
    Promise.all(promises)
        .then((responseObjects) => {
          responseObjects.forEach((responseObject) => {
            const img = new Image(responseObject.width, responseObject.height);
            img.alt = `Illustrative ${search.value.toLowerCase()} image`;
            img.src = URL.createObjectURL(responseObject.blob);
            gallery.appendChild(img);
          });
          target.innerHTML = '';
          target.appendChild(fragment);
        })
        .catch((e) => console.error(e));
  };

  const lazyLoadInit = (root = false) => {
    const things = root ?
          root.querySelectorAll('.lazyload') :
          document.querySelectorAll('.lazyload');
    things.forEach((thing) => {
      observer.observe(thing);
    });
  };

  window.addEventListener('offline', () => {
    offline.style.display = 'flex';
    search.disabled = true;
    button.disabled = true;
    document.querySelectorAll('[data-active="true"]').forEach((item) => {
      item.disabled = true;
    });
  });

  window.addEventListener('online', () => {
    offline.style.display = 'none';
    search.disabled = false;
    button.disabled = false;
    document.querySelectorAll('[data-active="true"]').forEach((item) => {
      item.disabled = false;
    });
    if (main.dataset.hydrated === 'false') {
      init();
    }
    lazyLoadInit();
  });

  const showSkeletonContent = () => {
    main.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const content = template.content;
      const labels = content.querySelectorAll('.tab label');
      const tabContents = content.querySelectorAll('.tabcontent');
      content.querySelectorAll('.tab input').forEach((input, index) => {
        const id = Math.random().toString().substr(2);
        input.name = `tabgroup${i}`;
        input.id = id;
        labels[index].setAttribute('for', id);
        tabContents[index].setAttribute('aria-labelledby', id);
      });
      main.appendChild(document.importNode(content, true));
    }
  };

  const firstTimeSetup = () => {
    document.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      showSkeletonContent();
      init();
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      let previouslyEngaged = localStorage.getItem('engagement');
      if (!previouslyEngaged) {
        console.log('Install button hidden due to no prior engagement');
        return;
      }
      previouslyEngaged = parseInt(previouslyEngaged, 10);
      if (isNaN(previouslyEngaged) || previouslyEngaged < INSTALL_THRESHOLD) {
        console.log('Install button hidden due to not enough prior engagement');
        return;
      }
      event.preventDefault();
      installPromptEvent = event;
      install.disabled = false;
      install.hidden = false;
    });

    install.addEventListener('click', () => {
      install.disabled = true;
      install.hidden = true;
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        installPromptEvent = null;
      });
    });

    showSkeletonContent();

    const online = navigator.onLine;
    offline.style.display = online ? 'none' : 'flex';
    search.disabled = !online;
    button.disabled = !online;

    if (online) {
      init();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
          .then((registration_) => {
            registration = registration_;
            registration.onupdatefound = cachePolyfills;
            cachePolyfills();
          })
          .catch((e) => console.error(e));
    }
  };

  const pushNotifications = async () => {
    if (!registration || !('pushManager' in registration)) {
      return false;
    }
    const urlBase64ToUint8Array = (base64String) => {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    return registration.pushManager.getSubscription()
        .then((subscription) => {
          if (subscription) {
            return subscription;
          }

          const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
        })
        .then((subscription) => {
          fetch('https://affilicats-push.glitch.me/push/sendNotification', {
            method: 'post',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              subscription: subscription,
              delay: 5,
              ttl: 0,
            }),
          });
          return fetch('https://affilicats-push.glitch.me/push/register', {
            method: 'post',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              subscription: subscription,
            }),
          })
              .then((response) => response.ok);
        })
        .catch((e) => {
          console.error(e);
          return false;
        });
  };

  const cachePolyfills = async () => {
    const fetchAndCache = async (url) => {
      const request = new Request(url, {mode: 'no-cors'});
      return fetch(request)
          .then((response) => {
            return cache.put(request, response);
          })
          .catch((e) => console.error(e));
    };

    const keys = await caches.keys();
    const cache = await caches.open(keys.filter(
        (key) => /^offline_/.test(key))[0]);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (localStorage.getItem(key) === 'polyfill') {
        switch (key) {
          case 'IntersectionObserver':
            fetchAndCache('https://unpkg.com/intersection-observer@0.5.0/intersection-observer.js');
            break;
          case 'PWACompat':
            fetchAndCache('https://unpkg.com/pwacompat@2.0.7/pwacompat.min.js');
            break;
          case 'URLSearchParams':
            fetchAndCache('https://unpkg.com/url-search-params@1.1.0/build/url-search-params.js');
            break;
        }
      };
    }
  };

  const init = async () => {
    // Get real content
    const params = new URLSearchParams(document.location.search);
    const prevSearch = params.get('query');
    if (prevSearch && !search.value) {
      search.value = prevSearch;
    }
    if (!prevSearch && !search.value) {
      search.value = DEFAULT_SEARCH;
    }
    const query = search.value || DEFAULT_SEARCH;
    const cats = await getCats(query);
    if (Array.isArray(cats) && cats.length > 0) {
      main.dataset.hydrated = 'true';
      if (query !== DEFAULT_SEARCH) {
        history.pushState(
            {},
            '',
            `${document.location.origin}${document.location.pathname}?query=${
              encodeURIComponent(query)}`);
      }
      renderCats(cats, template, main);
    } else {
      main.innerHTML = `<p>😥 No results found.</p>
          <p>Try anything that is a
          <a href="https://commons.wikimedia.org/wiki/Category:Topics">
          Wikimedia Categorie</a>. Maybe try
          <a href="./?query=Elephants">Elephants</a> 🐘</p>`;
    }
    lazyLoadInit();
  };

  firstTimeSetup();
})();
