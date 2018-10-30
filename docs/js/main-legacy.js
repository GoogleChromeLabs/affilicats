"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @license
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
(function () {
  var DEFAULT_SEARCH = 'Felis silvestris catus';
  var INSTALL_THRESHOLD = 2; // eslint-disable-next-line max-len

  var VAPID_PUBLIC_KEY = 'BHuCD9Ym4yXI9Fk0KHrRcPgH2iQOXhoWbzWtm4GQocD1zGYz4IXyazINE_-T4pEojrAgqoGoRnxUgX5CAuguRGo';
  var offline = document.querySelector('.offline');
  var main = document.querySelector('main');
  var search = document.querySelector('input[type="search"]');
  var button = document.querySelector('button[type="submit"]');
  var template = document.getElementById('cat');
  var install = document.querySelector('.install');
  var installPromptEvent;
  var registration;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio > 0) {
        var target = entry.target;
        observer.unobserve(target); // Lazy-load image

        if (target.nodeName === 'IMG') {
          // Cache-bust so the browser doesn't use a cached fallback image
          return target.src = "".concat(target.dataset.src).concat(/\?/.test(target.dataset.src) ? '&' : '?').concat(Math.random().toString().substr(2));
        }

        var classList = target.classList; // Lazy-load photos

        if (classList.contains('photos')) {
          return loadPhotos(target);
        } // Lazy-load reviews


        if (classList.contains('reviews')) {
          return loadReviews(target);
        } // Lazy-load offers


        if (classList.contains('offers')) {
          return loadOffers(target);
        }
      }
    });
  });

  var getCats =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(query) {
      var url;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              url = 'https://commons.wikimedia.org/w/api.php' + '?action=query' + '&generator=categorymembers' + '&gcmlimit=max' + '&gcmtype=file' + "&gcmtitle=Category:".concat(encodeURIComponent(query.replace(/\s/g, ' '))) + '&prop=imageinfo' + '&iiurlwidth=500' + '&iiprop=extmetadata|url' + '&iiextmetadatafilter=ImageDescription' + '&format=json&origin=*';
              return _context.abrupt("return", fetch(url).then(function (response) {
                if (!response.ok) {
                  throw new TypeError("Could not load ".concat(url));
                }

                return response.json();
              }).then(function (data) {
                if (!data || !data.query || !data.query.pages) {
                  return;
                }

                return Object.keys(data.query.pages).map(function (key) {
                  var entry = data.query.pages[key];

                  try {
                    entry = entry.imageinfo[0];
                    var src = entry.thumburl;
                    var _url = entry.descriptionshorturl;
                    var width = entry.thumbwidth;
                    var height = entry.thumbheight;
                    var description = entry.extmetadata.ImageDescription.value;
                    return {
                      url: _url,
                      src: src,
                      description: description,
                      width: width,
                      height: height
                    };
                  } catch (e) {
                    return;
                  }
                }).filter(function (item) {
                  return typeof item !== 'undefined';
                });
              }).catch(function (e) {
                return console.error(e);
              }));

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function getCats(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var renderCats = function renderCats(data, template, main) {
    var pushSupported = registration && 'pushManager' in registration;
    var fragment = document.createDocumentFragment();
    data.forEach(function (cat, index) {
      var catContainer = document.importNode(template.content, true); // Image

      var img = catContainer.querySelector('figure img');
      img.alt = "Illustrative ".concat(search.value.toLowerCase(), " image");
      img.classList.add('lazyload');
      img.dataset.src = cat.src; // Description

      var figcaption = catContainer.querySelector('figcaption');
      figcaption.textContent = (figcaption.innerHTML = cat.description, figcaption.textContent); // Metadata

      var priceDrop = catContainer.querySelector('.pricedrop');

      if (pushSupported) {
        priceDrop.addEventListener('click', function () {
          priceDrop.innerHTML = priceDrop.innerHTML.replace('🛎', '⏳');

          _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee2() {
            var pushSucceeded;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return pushNotifications();

                  case 2:
                    pushSucceeded = _context2.sent;

                    if (pushSucceeded) {
                      priceDrop.disabled = true;
                      priceDrop.dataset.active = 'false';
                      priceDrop.innerHTML = priceDrop.innerHTML.replace('⏳', '✅');
                    } else {
                      priceDrop.innerHTML = priceDrop.innerHTML.replace('⏳', '🛎');
                    }

                  case 4:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }))();
        });
        priceDrop.hidden = false;
      } else {
        priceDrop.hidden = true;
      }

      var cuteness = catContainer.querySelector('.cuteness');
      cuteness.textContent = "".concat('😻'.repeat(Math.floor(Math.random() * 5) + 1));
      var price = catContainer.querySelector('.price');
      price.textContent = "".concat('💰'.repeat(Math.floor(Math.random() * 3) + 1)); // Outlink

      var outlink = catContainer.querySelector('.outlink');
      var outclickURL = "./forward.html?url=".concat(encodeURIComponent(cat.url));
      outlink.dataset.href = outclickURL;
      catContainer.querySelector('.offers').dataset.outclickURL = outclickURL;
      outlink.textContent = '📦 View Deal';
      outlink.addEventListener('click', function (e) {
        var previouslyEngaged = localStorage.getItem('engagement');

        if (!previouslyEngaged) {
          localStorage.setItem('engagement', 1);
        } else {
          previouslyEngaged = parseInt(previouslyEngaged, 10);

          if (!isNaN(previouslyEngaged) && previouslyEngaged < INSTALL_THRESHOLD) {
            localStorage.setItem('engagement', ++previouslyEngaged);
          }
        }

        document.location.href = outlink.dataset.href;
      }); // Tabs

      var tabs = catContainer.querySelector('.tabs');
      tabs.addEventListener('click', function () {
        lazyLoadInit(tabs);
      });
      var labels = tabs.querySelectorAll('.tab label');
      var tabContents = tabs.querySelectorAll('.tabcontent');
      tabs.querySelectorAll('.tab input').forEach(function (input, i) {
        var id = Math.random().toString().substr(2);
        input.name = "tabgroup".concat(index);
        input.id = id;
        labels[i].setAttribute('for', id);
        tabContents[i].setAttribute('aria-labelledby', id);
      }); // Map

      var map = tabs.querySelector('.map');
      var lat = Math.round((Math.random() < 0.5 ? -1 : 1) * Math.random() * 90 * 100000) / 100000;
      var long = Math.round((Math.random() < 0.5 ? -1 : 1) * Math.random() * 180 * 100000) / 100000;
      map.dataset.src = 'https://maps.googleapis.com/maps/api/staticmap' + '?autoscale=1' + '&size=500x350' + '&maptype=terrain' + '&key=AIzaSyBWZnCRi6oar3MTjR0HkR1lK52_mTe0Rks' + '&format=png' + "&markers=size:small%7Ccolor:0xfffb00%7C".concat(lat, ",").concat(long);
      map.alt = "Map centered on latitude ".concat(lat, " and longitude ").concat(long);
      tabs.querySelector('.lat').textContent = lat;
      tabs.querySelector('.long').textContent = long;
      fragment.appendChild(catContainer);
    });
    main.innerHTML = '';
    main.appendChild(fragment);
  };

  var loadOffers = function loadOffers(offers) {
    var outclickURL = offers.dataset.outclickURL;
    var fragment = document.createDocumentFragment();
    var url = 'https://www.random.org/integers/' + "?num=".concat(Math.floor(Math.random() * 4) + 2) + '&min=5&max=20&col=1&base=10&format=plain&rnd=new';
    fetch(url).then(function (response) {
      if (!response.ok) {
        throw new TypeError("Could not load ".concat(url));
      }

      return response.text();
    }).then(function (text) {
      var numbers = text.split(/\n/g);
      numbers.splice(-1, 1);
      numbers.map(function (text) {
        return isNaN(parseInt(text, 10)) ? text : parseInt(text + '9', 10);
      }).sort(function (a, b) {
        return a - b;
      }).map(function (number, index) {
        var li = document.createElement('li');
        li.innerHTML = /\d+/.test(number) ? '<sup>$</sup>' + "<span class=\"price\">".concat(number, "</span> |") + "<a href=\"".concat(outclickURL, "\">Affiliate ").concat(index, "</a>") : number;
        fragment.appendChild(li);
      });
      offers.innerHTML = '';
      offers.appendChild(fragment);
    }).catch(function (e) {
      return console.error(e);
    });
  };

  var loadReviews = function loadReviews(target) {
    var fragment = document.createDocumentFragment();
    var promises = [];

    var _loop = function _loop(i, lenI) {
      var url = "https://baconipsum.com/api/?type=all-meat&paras=".concat(Math.floor(Math.random() * 3) + 1, "&start-with-lorem=1&random=").concat(i);
      promises[i] = fetch(url).then(function (response) {
        if (!response.ok) {
          throw new TypeError("Could not load ".concat(url));
        }

        return response.json();
      }).then(function (sentences) {
        return "<li>".concat(sentences.map(function (sentence) {
          return "<p>".concat(sentence, "</p>");
        }).join(''), "</li>");
      }).catch(function (e) {
        return console.error(e);
      });
    };

    for (var i = 0, lenI = Math.floor(Math.random() * 6) + 2; i < lenI; i++) {
      _loop(i, lenI);
    }

    Promise.all(promises).then(function (reviews) {
      return reviews.join('');
    }).then(function (reviews) {
      var ul = document.createElement('ul');
      ul.innerHTML = reviews;
      fragment.appendChild(ul);
      target.innerHTML = '';
      target.appendChild(fragment);
    });
  };

  var loadPhotos = function loadPhotos(target) {
    var fragment = document.createDocumentFragment();
    var gallery = document.createElement('div');
    gallery.classList.add('gallery');
    fragment.appendChild(gallery);
    var promises = [];

    var _loop2 = function _loop2(i, lenI) {
      var width = (Math.floor(Math.random() * 10) + 20) * 10;
      var height = (Math.floor(Math.random() * 5) + 20) * 10;
      var url = "https://placekitten.com/".concat(width, "/").concat(height, "?random=").concat(i);
      promises[i] = fetch(url).then(function (response) {
        if (!response.ok) {
          throw new TypeError("Could not load ".concat(url));
        }

        return response.blob();
      }).then(function (blob) {
        return {
          width: width,
          height: height,
          blob: blob
        };
      });
    };

    for (var i = 0, lenI = Math.floor(Math.random() * 15) + 2; i < lenI; i++) {
      _loop2(i, lenI);
    }

    Promise.all(promises).then(function (responseObjects) {
      responseObjects.forEach(function (responseObject) {
        var img = new Image(responseObject.width, responseObject.height);
        img.alt = "Illustrative ".concat(search.value.toLowerCase(), " image");
        img.src = URL.createObjectURL(responseObject.blob);
        gallery.appendChild(img);
      });
      target.innerHTML = '';
      target.appendChild(fragment);
    }).catch(function (e) {
      return console.error(e);
    });
  };

  var lazyLoadInit = function lazyLoadInit() {
    var root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var things = root ? root.querySelectorAll('.lazyload') : document.querySelectorAll('.lazyload');
    things.forEach(function (thing) {
      observer.observe(thing);
    });
  };

  window.addEventListener('offline', function () {
    offline.style.display = 'flex';
    search.disabled = true;
    button.disabled = true;
    document.querySelectorAll('[data-active="true"]').forEach(function (item) {
      item.disabled = true;
    });
  });
  window.addEventListener('online', function () {
    offline.style.display = 'none';
    search.disabled = false;
    button.disabled = false;
    document.querySelectorAll('[data-active="true"]').forEach(function (item) {
      item.disabled = false;
    });

    if (main.dataset.hydrated === 'false') {
      init();
    }

    lazyLoadInit();
  });

  var showSkeletonContent = function showSkeletonContent() {
    main.innerHTML = '';

    var _loop3 = function _loop3(i) {
      var content = template.content;
      var labels = content.querySelectorAll('.tab label');
      var tabContents = content.querySelectorAll('.tabcontent');
      content.querySelectorAll('.tab input').forEach(function (input, index) {
        var id = Math.random().toString().substr(2);
        input.name = "tabgroup".concat(i);
        input.id = id;
        labels[index].setAttribute('for', id);
        tabContents[index].setAttribute('aria-labelledby', id);
      });
      main.appendChild(document.importNode(content, true));
    };

    for (var i = 0; i < 3; i++) {
      _loop3(i);
    }
  };

  var firstTimeSetup = function firstTimeSetup() {
    document.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      showSkeletonContent();
      init();
    });
    window.addEventListener('beforeinstallprompt', function (event) {
      var previouslyEngaged = localStorage.getItem('engagement');

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
    install.addEventListener('click', function () {
      install.disabled = true;
      install.hidden = true;
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then(function (choice) {
        if (choice.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }

        installPromptEvent = null;
      });
    });
    showSkeletonContent();
    var online = navigator.onLine;
    offline.style.display = online ? 'none' : 'flex';
    search.disabled = !online;
    button.disabled = !online;

    if (online) {
      init();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then(function (registration_) {
        registration = registration_;
        registration.onupdatefound = cachePolyfills;
        cachePolyfills();
      }).catch(function (e) {
        return console.error(e);
      });
    }
  };

  var pushNotifications =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var urlBase64ToUint8Array;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(!registration || !('pushManager' in registration))) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", false);

            case 2:
              urlBase64ToUint8Array = function urlBase64ToUint8Array(base64String) {
                var padding = '='.repeat((4 - base64String.length % 4) % 4);
                var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
                var rawData = window.atob(base64);
                var outputArray = new Uint8Array(rawData.length);

                for (var i = 0; i < rawData.length; ++i) {
                  outputArray[i] = rawData.charCodeAt(i);
                }

                return outputArray;
              };

              return _context3.abrupt("return", registration.pushManager.getSubscription().then(function (subscription) {
                if (subscription) {
                  return subscription;
                }

                var convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedVapidKey
                });
              }).then(function (subscription) {
                fetch('https://affilicats-push.glitch.me/push/sendNotification', {
                  method: 'post',
                  headers: {
                    'content-type': 'application/json'
                  },
                  body: JSON.stringify({
                    subscription: subscription,
                    delay: 5,
                    ttl: 0
                  })
                });
                return fetch('https://affilicats-push.glitch.me/push/register', {
                  method: 'post',
                  headers: {
                    'content-type': 'application/json'
                  },
                  body: JSON.stringify({
                    subscription: subscription
                  })
                }).then(function (response) {
                  return response.ok;
                });
              }).catch(function (e) {
                console.error(e);
                return false;
              }));

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function pushNotifications() {
      return _ref3.apply(this, arguments);
    };
  }();

  var cachePolyfills =
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var fetchAndCache, keys, cache, i, key;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              fetchAndCache =
              /*#__PURE__*/
              function () {
                var _ref5 = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee4(url) {
                  var request;
                  return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          request = new Request(url, {
                            mode: 'no-cors'
                          });
                          return _context4.abrupt("return", fetch(request).then(function (response) {
                            return cache.put(request, response);
                          }).catch(function (e) {
                            return console.error(e);
                          }));

                        case 2:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4, this);
                }));

                return function fetchAndCache(_x2) {
                  return _ref5.apply(this, arguments);
                };
              }();

              _context5.next = 3;
              return caches.keys();

            case 3:
              keys = _context5.sent;
              _context5.next = 6;
              return caches.open(keys.filter(function (key) {
                return /^offline_/.test(key);
              })[0]);

            case 6:
              cache = _context5.sent;
              i = 0;

            case 8:
              if (!(i < localStorage.length)) {
                _context5.next = 24;
                break;
              }

              key = localStorage.key(i);

              if (!(localStorage.getItem(key) === 'polyfill')) {
                _context5.next = 20;
                break;
              }

              _context5.t0 = key;
              _context5.next = _context5.t0 === 'IntersectionObserver' ? 14 : _context5.t0 === 'PWACompat' ? 16 : _context5.t0 === 'URLSearchParams' ? 18 : 20;
              break;

            case 14:
              fetchAndCache('https://unpkg.com/intersection-observer@0.5.0/intersection-observer.js');
              return _context5.abrupt("break", 20);

            case 16:
              fetchAndCache('https://unpkg.com/pwacompat@2.0.7/pwacompat.min.js');
              return _context5.abrupt("break", 20);

            case 18:
              fetchAndCache('https://unpkg.com/url-search-params@1.1.0/build/url-search-params.js');
              return _context5.abrupt("break", 20);

            case 20:
              ;

            case 21:
              i++;
              _context5.next = 8;
              break;

            case 24:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    return function cachePolyfills() {
      return _ref4.apply(this, arguments);
    };
  }();

  var init =
  /*#__PURE__*/
  function () {
    var _ref6 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var params, prevSearch, query, cats;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              // Get real content
              params = new URLSearchParams(document.location.search);
              prevSearch = params.get('query');

              if (prevSearch && !search.value) {
                search.value = prevSearch;
              }

              if (!prevSearch && !search.value) {
                search.value = DEFAULT_SEARCH;
              }

              query = search.value || DEFAULT_SEARCH;
              _context6.next = 7;
              return getCats(query);

            case 7:
              cats = _context6.sent;

              if (Array.isArray(cats) && cats.length > 0) {
                main.dataset.hydrated = 'true';

                if (query !== DEFAULT_SEARCH) {
                  history.pushState({}, '', "".concat(document.location.origin).concat(document.location.pathname, "?query=").concat(encodeURIComponent(query)));
                }

                renderCats(cats, template, main);
              } else {
                main.innerHTML = '<p>😥 No results found.</p>' + '<p>Try anything that is a' + '<a href="https://commons.wikimedia.org/wiki/Category:Topics">' + 'Wikimedia Categorie</a>. Maybe try' + '<a href="./?query=Elephants">Elephants</a> 🐘</p>';
              }

              lazyLoadInit();

            case 10:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    return function init() {
      return _ref6.apply(this, arguments);
    };
  }();

  firstTimeSetup();
})();
