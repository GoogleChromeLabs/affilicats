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
(()=>{window.addEventListener("beforeinstallprompt",()=>{});const a=document.querySelector(".offline"),b=document.getElementById("hourglass"),c=document.getElementById("seconds");c.textContent=`${9} seconds…`;const d=document.getElementById("forward"),e=navigator.onLine,f=new URLSearchParams(document.location.search),g=new URL(f.get("url"));d.textContent=g.host,d.href=g;const h=new function(a,b){let d,f,g=b;this.running=!1,this.counter=0,this.pause=()=>{this.running=!1,window.clearTimeout(d),g-=new Date-f},this.resume=()=>{this.running=!0,f=new Date,window.clearTimeout(d),d=window.setTimeout(a,g)},window.setInterval(()=>{if(this.running){this.counter++;const a=9-this.counter;c.textContent=0<a?1<a?`${a} seconds…`:`${a} second…`:"no time!"}},1e3),e&&this.resume()}(()=>{document.location.href=g},9000);a.style.display=e?"none":"flex",e?(b.classList.add("spin"),d.classList.remove("noclick")):(b.classList.remove("spin"),d.classList.add("noclick")),window.addEventListener("offline",()=>{a.style.display="flex",b.classList.remove("spin"),d.classList.add("noclick"),h.pause()}),window.addEventListener("online",()=>{a.style.display="none",b.classList.add("spin"),d.classList.remove("noclick"),h.resume()})})();