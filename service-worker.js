const CACHE_NAME = 'rope-flow-v1';
const ASSETS = [
  'index.html',
  'ropeflow-styles.css',
  'whip-afro-dancehall-music-110235.mp3' // 여기에 배경음악 파일명을 넣으세요!
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
