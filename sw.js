const CACHE='nb-v4';
const STATIC=['/nokkelbokser/','/nokkelbokser/index.html','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Never cache API/map/external calls
  if(/supabase|geonorge|openstreetmap/.test(e.request.url))return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      // Return cached immediately, update in background
      const fetchPromise=fetch(e.request).then(response=>{
        if(response&&response.status===200&&response.type!=='opaque'){
          const clone=response.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return response;
      }).catch(()=>null);
      return cached||fetchPromise;
    })
  );
});
