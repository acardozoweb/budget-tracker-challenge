const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILED_TO_CACHE = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/index.js",
    "/js/idb.js",
    "/manifest.json",
    "/icon-72x72.png",
    "/icon-96x96.png",
    "/icon-128x128.png",
    "/icon-144x144.png",
    "/icon-152x152.png",
    "/icon-192x192.png",
    "/icon-384x384.png",
    "/icon-512x512.png",
];


// install service worker, cache resources
self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Files have been cached.");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});


// activate service worker, remove old cache data
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});


// intercept fetch requests
self.addEventListener("fetch", function (e) {
    if (e.request.url.includes("/api/")) {
        e.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then((cache) => {
                return fetch(e.request)
                .then((response) => {
                    if (response === 200) {
                        cache.put(e.request.url, response.clone());
                    }
                    return response;
                })
                .catch((err) => {
                    return cache.match(e.request);
                });
            })
            .catch((err) => console.log(err))
        );
        return;
    }
    e.respondWith(
        fetch(e.request).catch(function () {
          return caches.match(e.request).then(function (response) {
            if (response) {
              return response;
            } else if (e.request.headers.get("accept").includes("text/html")) {
              return caches.match("/");
            }
          });
        })
      );
});