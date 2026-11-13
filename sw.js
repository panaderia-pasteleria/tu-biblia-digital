const CACHE_NAME = 'tu-biblia-digital-v6';
const CACHE_PREFIX = 'tu-biblia-digital-';
const FILES_TO_CACHE = ['/', '/index.html', '/SpaRV.json', '/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/banner-blanco.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(FILES_TO_CACHE.map(p=>new Request(p,{cache:'reload'})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'||url.pathname==='/'||url.pathname==='/index.html'){
    event.respondWith((async()=>{
      try{
        const res=await fetch(req);
        if(res.ok){const cache=await caches.open(CACHE_NAME);await cache.put(req,res.clone());}
        return res;
      }catch(e){return (await caches.match(req))||(await caches.match('/index.html'))||(await caches.match('/'))||Response.error();}
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached)return cached;
    const res=await fetch(req);
    if(res.ok){const cache=await caches.open(CACHE_NAME);await cache.put(req,res.clone());}
    return res;
  })());
});
