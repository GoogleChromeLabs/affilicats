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

(() => {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Do nothing, handle from main app
    return;
  });

  const REDIRECT_TIMEOUT = 9;
  const offline = document.querySelector('.offline');
  const hourglass = document.getElementById('hourglass');
  const seconds = document.getElementById('seconds');
  seconds.textContent = `${REDIRECT_TIMEOUT} seconds…`;
  const forwardLink = document.getElementById('forward');

  const online = navigator.onLine;

  const Timer = function(callback, delay) {
    let remaining = delay;
    let timerId;
    let start;

    this.running = false;

    this.counter = 0;

    this.pause = () => {
      this.running = false;
      window.clearTimeout(timerId);
      remaining -= new Date() - start;
    };

    this.resume = () => {
      this.running = true;
      start = new Date();
      window.clearTimeout(timerId);
      timerId = window.setTimeout(callback, remaining);
    };

    window.setInterval(() => {
      if (this.running) {
        this.counter++;
        const countDown = REDIRECT_TIMEOUT - this.counter;
        seconds.textContent = countDown > 0 ?
            (countDown > 1 ? `${countDown} seconds…` : `${countDown} second…`) :
            'no time!';
      }
    }, 1000);

    if (online) {
      this.resume();
    }
  };

  const params = new URLSearchParams(document.location.search);
  const url = new URL(params.get('url'));
  forwardLink.textContent = url.host;
  forwardLink.href = url;

  const timer = new Timer(() => {
    document.location.href = url;
  }, REDIRECT_TIMEOUT * 1000);

  offline.style.display = online ? 'none' : 'flex';
  if (online) {
    hourglass.classList.add('spin');
    forwardLink.classList.remove('noclick');
  } else {
    hourglass.classList.remove('spin');
    forwardLink.classList.add('noclick');
  }

  window.addEventListener('offline', () => {
    offline.style.display = 'flex';
    hourglass.classList.remove('spin');
    forwardLink.classList.add('noclick');
    timer.pause();
  });

  window.addEventListener('online', () => {
    offline.style.display = 'none';
    hourglass.classList.add('spin');
    forwardLink.classList.remove('noclick');
    timer.resume();
  });
})();
