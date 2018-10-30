"use strict";/**
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
 */(function(){window.addEventListener("beforeinstallprompt",function(){});var a=document.querySelector(".offline"),b=document.getElementById("hourglass"),c=document.getElementById("seconds");c.textContent="".concat(9," seconds\u2026");var d=document.getElementById("forward"),e=navigator.onLine,f=new URLSearchParams(document.location.search),g=new URL(f.get("url"));d.textContent=g.host,d.href=g;var h=new function i(a,b){var d,f,g=this,h=b;this.running=!1,this.counter=0,this.pause=function(){g.running=!1,window.clearTimeout(d),h-=new Date-f},this.resume=function(){g.running=!0,f=new Date,window.clearTimeout(d),d=window.setTimeout(a,h)},window.setInterval(function(){if(g.running){g.counter++;var a=9-g.counter;c.textContent=0<a?1<a?"".concat(a," seconds\u2026"):"".concat(a," second\u2026"):"no time!"}},1e3),e&&this.resume()}(function(){document.location.href=g},9000);a.style.display=e?"none":"flex",e?(b.classList.add("spin"),d.classList.remove("noclick")):(b.classList.remove("spin"),d.classList.add("noclick")),window.addEventListener("offline",function(){a.style.display="flex",b.classList.remove("spin"),d.classList.add("noclick"),h.pause()}),window.addEventListener("online",function(){a.style.display="none",b.classList.add("spin"),d.classList.remove("noclick"),h.resume()})})();
