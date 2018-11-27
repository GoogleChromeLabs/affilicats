# 🐈 AffiliCats

A Progressive Web App demo that showcases various **flaky network resilience measures**.

The core idea is to simulate an affiliate or comparison app with various API calls
(*e.g.*, for prices, stars, reviews, location, photos) proxied by dummy *lorem ipsum* type APIs
where the conversion action is to click through to a third-party and place the affiliate cookie
(that's the click the app never wants to lose).

## Demo

Play with the app at
👉 [googlechromelabs.github.io/affilicats](https://googlechromelabs.github.io/affilicats/) 👈.

<img alt="Screenshot of the AffiliCats app" src="https://github.com/GoogleChromeLabs/affilicats/blob/master/assets/screenshot.png" width="320">

## Developing and Building

You can develop in the `/src` folder while you work on the app locally. Lint your code via `npm run lint`.

The app is remotely [deployed from the `/docs` folder](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).
You can build to there by running `npm run build`.

## Things to try

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

## Acknowledgements

Thanks to [@jeffposnick](https://github.com/jeffposnick) for the thorough(!) review of the app's service worker code
and [@argyleink](https://github.com/argyleink) for the amazing(!) design.

## License

Copyright 2018 Google LLC. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
