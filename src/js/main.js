const offline = document.querySelector('.offline');
const main = document.querySelector('main');
const search = document.querySelector('input');
const button = document.querySelector('button');
const template = document.getElementById('cat');

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
      &iiurlheight=100
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
    const stars = catContainer.querySelector('.stars');
    stars.textContent = `Cuteness rating: ${'😻'.repeat(Math.floor(
        Math.random() * 5) + 1)}`;
    const price = catContainer.querySelector('.price');
    price.textContent = `Price range: ${'💰'.repeat(Math.floor(
        Math.random() * 3) + 1)}`;
    // Outlink
    const a = catContainer.querySelector('.outlink');
    a.href = `./forward.html?url=${encodeURIComponent(cat.url)}`;
    a.textContent = 'View Deal';
    // Tabs
    const tabs = catContainer.querySelector('.tabs');
    tabs.addEventListener('click', () => {
      lazyLoadInit(tabs);
    });
    const labels = tabs.querySelectorAll('label');
    tabs.querySelectorAll('input').forEach((input, i) => {
      const id = Math.random().toString().substr(2);
      input.name = `tabgroup${index}`;
      input.id = id;
      labels[i].setAttribute('for', id);
    });
    // Map
    const map = tabs.querySelector('.map');
    const lat = Math.round((Math.random() < 0.5 ? -1 : 1) *
        Math.random() * 90 * 100000) / 100000;
    const long = Math.round((Math.random() < 0.5 ? -1 : 1) *
        Math.random() * 180 * 100000) / 100000;
    map.dataset.src = `https://maps.googleapis.com/maps/api/staticmap
        ?autoscale=1
        &size=500x400
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
              li.textContent = /\d+/.test(number) ?
          `From $${number} at Affiliate ${index}` : number;
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
    const width = (Math.floor(Math.random() * 10) + 10) * 10;
    const height = (Math.floor(Math.random() * 5) + 10) * 10;
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
  offline.hidden = false;
  search.disabled = true;
  button.disabled = true;
});

window.addEventListener('online', () => {
  offline.hidden = true;
  search.disabled = false;
  button.disabled = false;

  if (main.dataset.hydrated === 'false') {
    init();
  }
  lazyLoadInit();
});

const firstTimeSetup = () => {
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    init();
  });

  for (let i = 0; i < 3; i++) {
    const content = template.content;
    const labels = content.querySelectorAll('label');
    content.querySelectorAll('input').forEach((input, index) => {
      const id = Math.random().toString().substr(2);
      input.name = `tabgroup${i}`;
      input.id = id;
      labels[index].setAttribute('for', id);
    });
    main.appendChild(document.importNode(content, true));
  }

  const online = navigator.onLine;
  offline.hidden = online;
  search.disabled = !online;
  button.disabled = !online;

  if (online) {
    init();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log(`Service worker registered for scope ${
            registration.scope}`);
          registration.onupdatefound = cachePolyfills;
        })
        .catch((e) => console.error(e));
  }
};

const cachePolyfills = async () => {
  const fetchAndCache = async (url) => {
    const request = new Request(url, {mode: 'no-cors'});
    return fetch(request)
        .then((response) => {
          if (!response.ok) {
            throw new TypeError('Bad response status');
          }
          return cache.put(request, response);
        });
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
          fetchAndCache('https://cdn.jsdelivr.net/npm/pwacompat@2.0.7/pwacompat.min.js');
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
  const query = search.value || 'Felis_silvestris_catus';
  const cats = await getCats(query);
  if (cats && cats.length) {
    main.dataset.hydrated = 'true';
    renderCats(cats, template, main);
  }
  lazyLoadInit();
};

firstTimeSetup();
