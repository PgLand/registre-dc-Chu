const CACHE_NAME = 'registre-chup-pwa-v5';
const APP_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './assets/css/fontawesome.min.css',
    './assets/js/tailwind.min.js',
    './assets/js/xlsx.full.min.js',
    './assets/data/cim10-fr-2008.js',
    './assets/data/cim10-fr-2008.json',
    './assets/icons/icon.svg',
    './assets/icons/icon-180.png',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/webfonts/fa-brands-400.woff2',
    './assets/webfonts/fa-regular-400.woff2',
    './assets/webfonts/fa-solid-900.woff2',
    './assets/webfonts/fa-v4compatibility.woff2'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
                    }
                    return response;
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached => cached || fetch(request).then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
        }))
    );
});
