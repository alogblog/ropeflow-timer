const CACHE_NAME = 'rope-flow-v1.3';
const ASSETS = [
  'index.html',
  'voices.js',
  'ui.js',
  'lang.js',
  'ropeflow-styles.css',
  'alarm-327234.mp3',
  'whip-afro-dancehall-music-110235.mp3' // 여기에 배경음악 파일명을 넣으세요!
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
