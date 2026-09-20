// 离线缓存。改了 index.html 之后把下面的版本号加一，手机上重开两次应用就会换成新版。
const VERSION = 'wharflog-v10';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 先用缓存（没信号也能秒开），同时在后台拉新版本存起来，下次打开生效
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, {ignoreSearch: true});
    const fresh = fetch(req).then(res => { if(res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});
