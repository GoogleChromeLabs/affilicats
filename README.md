# 🐈 AffiliCats

A Progressive Web App demo that showcases various **flaky network resilience measures**.

The core idea is to simulate an affiliate or comparison app with various API calls
(*e.g.*, for prices, stars, reviews, location, photos) proxied by dummy *lorem ipsum* type APIs
where the conversion action is to click through to a third-party and place the affiliate cookie
(that's the click the app never wants to lose).

This application is used as the running example in the **accompanying YouTube series** called
[Why Build Progressive Web Apps](https://www.youtube.com/results?search_query=%22why+build+progressive+web+apps%22+%22thomas+steiner%22+%22Google+Chrome+Developers%22).

## 👀 See the Demo

Play with the app at
👉 [googlechromelabs.github.io/affilicats](https://googlechromelabs.github.io/affilicats/) 👈.

<img alt="Screenshot of the AffiliCats app" src="https://github.com/GoogleChromeLabs/affilicats/blob/master/assets/screenshot.png" width="320">

## 🔬 Things to try

### [📺 Episode 1](https://www.youtube.com/watch?v=4UK_TDTTWnQ) / [📝 Write-Up](https://medium.com/dev-channel/why-build-progressive-web-apps-never-lose-a-click-out-video-write-up-74cbbc466afd)

- **Use the app under ideal conditions:**
  You should be able to freely click and browse around, content should always lazy-load.
- **Search for something:**
  You should be able to search for anything that has a [Wikimedia Commons category page](https://commons.wikimedia.org/wiki/Category:Topics) with images, for example, "[Elephants](https://commons.wikimedia.org/wiki/Category:Elephants)".
- **Load while offline:**
  You should see skeleton content and fallback images.
- **Regain connection:**
  You should see the app hydrate and load content.
- **Lose connection while browsing:**
  You should see the offline note and be no longer able to search. When you scroll and click around, fallback content should be shown.
- **Click through to "View Deal" while offline:**
  You should always—offline or not—be able to click through and see a countdown (paused if already offline, pausing if losing connection).
- **Regain connection on the forward page:**
  The countdown should start or resume and you should be redirected to the landing page.
- **Use an ultra slow network:**
  You should see timeout placeholders (a little clock icon) and info text for timed-out requests.

### [📺 Episode 2](https://www.youtube.com/watch?v=vRsVx8_94UQ) / [📝 Write-Up](https://medium.com/dev-channel/why-build-progressive-web-apps-push-but-dont-be-pushy-video-write-up-aa78296886e)

- **Sign up for "Price Alerts":**
  After clicking the "Price Alerts" button, you should receive a push notification after a couple of seconds.
  As an additonal step, try quitting your web browser immediately after clicking the button
  and the push notification should still arrive. 
  
### [📺 Episode 3](https://youtu.be/kENeCdS3fzU) / [📝 Write-Up](https://medium.com/dev-channel/why-build-progressive-web-apps-if-its-just-a-bookmark-it-s-not-a-pwa-video-write-up-7ccca1c58034)

- **See the custom "Install" button:**
  Click through twice on any of the "View Deal" buttons and notice how the individual "Install" button appears.

## 💻 Developing and Building

You can develop in the `/src` folder while you work on the app locally. Lint your code via `npm run lint`.

The app is remotely [deployed from the `/docs` folder](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).
You can build to there by running `npm run build`.

## 🙏 Acknowledgements

Thanks to [@jeffposnick](https://github.com/jeffposnick) for the thorough(!) review of the app's service worker code
and [@argyleink](https://github.com/argyleink) for the amazing(!) design.

## ⚖️ License

Copyright 2018 Google LLC. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
