// Service worker: permite instalar Cripteando como app y abrirla sin internet.
// scripts/build.js reemplaza VERSION y PRECACHE con los archivos compilados; en la compu no se registra.
'use strict';
const VERSION = /*VERSION*/'dev';
const PRECACHE = /*PRECACHE*/[];
const FUENTES = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  // La página: siempre la versión de internet; sin conexión, la guardada
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('./', { ignoreSearch: true })));
    return;
  }
  // Archivos propios (tienen huella en el nombre): primero los guardados
  if (u.origin === location.origin) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put(r, copia)); }
      return res;
    })));
    return;
  }
  // Tipografías: la guardada al instante y se actualiza por detrás
  if (FUENTES.test(r.url)) {
    e.respondWith(caches.open(VERSION).then(c => c.match(r).then(m => {
      const red = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => m);
      return m || red;
    })));
  }
  // Firebase y el resto: sin tocar
});
