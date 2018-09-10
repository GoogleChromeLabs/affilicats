const REDIRECT_TIMEOUT = 10;
const offline = document.querySelector('.offline');
const hourglass = document.getElementById('hourglass');
const seconds = document.getElementById('seconds');
seconds.textContent = REDIRECT_TIMEOUT;
const forwardLink = document.getElementById('forward');

const Timer = function(callback, delay) {
  let remaining = delay;
  let timerId;
  let start;

  this.running = true;

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
      seconds.textContent = REDIRECT_TIMEOUT - this.counter;
    }
  }, 1000);

  this.resume();
};

const params = new URLSearchParams(document.location.search);
const url = new URL(params.get('url'));
forwardLink.textContent = url.host;
forwardLink.href = url;

const timer = new Timer(() => {
  document.location.href = url;
}, REDIRECT_TIMEOUT * 1000);

const online = navigator.onLine;
offline.hidden = online;
if (online) {
  hourglass.classList.add('spin');
  forwardLink.classList.remove('noclick');
} else {
  hourglass.classList.remove('spin');
  forwardLink.classList.add('noclick');
}

window.addEventListener('offline', () => {
  offline.hidden = false;
  hourglass.classList.remove('spin');
  forwardLink.classList.add('noclick');
  timer.pause();
});

window.addEventListener('online', () => {
  offline.hidden = true;
  hourglass.classList.add('spin');
  forwardLink.classList.remove('noclick');
  timer.resume();
});
