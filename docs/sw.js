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
 */const VERSION=1540904196177,OFFLINE_CACHE=`offline_${1540904196177}`,TIMEOUT=5e3,HOME_URL="https://googlechromelabs.github.io/affilicats/",OFFLINE_IMG_URL="./img/offline.svg",TIMEOUT_IMG_URL="./img/timeout.svg",MANIFEST_URL="./manifest.webmanifest",STATIC_FILES=["./index.html","./forward.html","./js/main.js","./js/forward.js","./img/cat.png","./img/map.svg","./css/main.css","./css/forward.css",MANIFEST_URL,OFFLINE_IMG_URL,TIMEOUT_IMG_URL];self.addEventListener("install",a=>{self.skipWaiting(),a.waitUntil((async()=>{const a=await caches.open(OFFLINE_CACHE);return await a.addAll(STATIC_FILES),await a.put("https://commons.wikimedia.org/timeout",new Response(JSON.stringify({query:{pages:{1:{imageinfo:[{thumburl:TIMEOUT_IMG_URL,thumbwidth:15,thumbheight:15,descriptionshorturl:"#",extmetadata:{ImageDescription:{value:"\uD83E\uDD37\u200D\u2642\uFE0F Results took too long to load\u2026"}}}]}}}}),{headers:{"content-type":"application/json"}})),await a.put("https://www.random.org/timeout",new Response("\uD83E\uDD37\u200D\u2640\uFE0F Offers timed out while loading\n",{headers:{"content-type":"text/plain"}})),await a.put("https://baconipsum.com/timeout",new Response(JSON.stringify(["\uD83E\uDD37\u200D\u2642\uFE0F Review took too long to load\u2026"]),{headers:{"content-type":"application/json"}})),await a.put("https://commons.wikimedia.org/offline",new Response(JSON.stringify({query:{pages:{1:{imageinfo:[{thumburl:OFFLINE_IMG_URL,thumbwidth:15,thumbheight:15,descriptionshorturl:"#",extmetadata:{ImageDescription:{value:"\uD83D\uDE4D\u200D\u2640\uFE0F Can't search while offline\u2026"}}}]}}}}),{headers:{"content-type":"application/json"}})),await a.put("https://www.random.org/offline",new Response("\uD83D\uDE4D\u200D\u2642\uFE0F Offers can't be loaded while offline\n",{headers:{"content-type":"text/plain"}})),void(await a.put("https://baconipsum.com/offline",new Response(JSON.stringify(["\uD83D\uDE4D\u200D\u2640\uFE0F Review can't be loaded while offline\u2026"]),{headers:{"content-type":"application/json"}})))})())}),self.addEventListener("activate",a=>{a.waitUntil((async()=>{const a=await caches.keys();return Promise.all(a.map(a=>{if(a!==OFFLINE_CACHE)return caches.delete(a)})).then(()=>self.clients.claim())})())}),self.addEventListener("fetch",a=>{// Fail early
if(!a.request.url.startsWith("http")||"GET"!==a.request.method)return;// Strategy 1: cache, falling back to network (i.e., strategy 2)
const b=async(a,b={},d={})=>{const e=await caches.open(OFFLINE_CACHE),f=await e.match(a,b);return f||c(a,"",new URL(a.url))},c=async(a,b,c)=>{// Race the timeout promise…
const d=new Promise(d=>setTimeout(async()=>{const e=await caches.open(OFFLINE_CACHE);if("image"===b)return d(e.match(TIMEOUT_IMG_URL));if("manifest"===b)return d(e.match(MANIFEST_URL));if(!b){if("https://commons.wikimedia.org"===c.origin||"https://www.random.org"===c.origin||"https://baconipsum.com"===c.origin)return d(e.match(`${c.origin}/timeout`,{ignoreSearch:!0}));if("https://placekitten.com"===c.origin)return d(e.match(TIMEOUT_IMG_URL))}return d(e.match(a))},TIMEOUT)),e=(async()=>{try{const b=await fetch(a);if(c.origin===location.origin&&!b.ok)throw new TypeError(`Could not load ${a.url}`);return b}catch(a){const d=await caches.open(OFFLINE_CACHE);if("image"===b)return d.match(OFFLINE_IMG_URL);if("manifest"===b)return d.match(MANIFEST_URL);if(!b){if("https://commons.wikimedia.org"===c.origin||"https://www.random.org"===c.origin||"https://baconipsum.com"===c.origin)return d.match(`${c.origin}/offline`);if("https://placekitten.com"===c.origin)return d.match(OFFLINE_IMG_URL)}}})();// …against the network promise
// Start the race
return Promise.race([d,e])};// Strategy 2: network, falling back to timeout content
// The actual handler
a.respondWith((async()=>{const d=a.request,e=new URL(d.url);// Deal with navigational requests
if("navigate"===d.mode){// The root `/` is actually cached as `/index.html`
if(e.pathname.endsWith("/")){e.pathname+="index.html";const a=e.href;return b(new Request(a),{ignoreSearch:!0})}// Any other resource
return b(d,{ignoreSearch:!0})}// Deal with non-navigational requests
const f=d.destination;if(f){// Deal with stylesheets
if("style"===f)return b(d);// Deal with scripts
if("script"===f)// Deal with polyfills
return"https://unpkg.com"===e.origin?b(d,{},{mode:"no-cors"}):b(d);// Deal with local scripts
// Deal with images
if("image"===f)return STATIC_FILES.includes(`${e.pathname.replace("/affilicats/","./")}`)?b(d):c(d,f,e)}// Deal with polyfills
return"https://unpkg.com"===e.origin?b(d,{},{mode:"no-cors"}):c(d,f,e);// Deal with everything else
})())}),self.addEventListener("push",a=>{a.waitUntil(self.registration.showNotification("\uD83D\uDC08 AffiliCats Price Drop Alert \uD83D\uDEA8",{body:"Prices for cats are going down! \uD83D\uDCC9",icon:"./img/cat.png"}))}),self.addEventListener("notificationclick",async a=>{a.waitUntil((async()=>{a.notification.close();const b=await clients.matchAll({type:"window"});for(const a of b)if(a.url===HOME_URL&&"focus"in a)return a.focus();if(clients.openWindow)return clients.openWindow(HOME_URL)})())});