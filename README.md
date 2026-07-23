# Champak Search PWA

Installable search application for `search.learnwithchampak.live`.

## Deploy

Upload every file and folder in this directory to the root of the hosting repository. Keep `CNAME` in the root. GitHub Pages will serve the site over HTTPS, which is required for PWA installation and service workers.

## PWA files

- `manifest.webmanifest` — app name, colors, icons and shortcuts
- `sw.js` — app-shell and search-data caching
- `offline.html` — offline fallback page
- `icons/` — standard, maskable and Apple touch icons
- `sw.js` — combined PWA caching and OneSignal notification worker
- `NOTIFICATIONS.md` — dashboard setup, broadcasts and testing

When `sw.js` changes, increment `CACHE_VERSION` so visitors receive the new cached files.
