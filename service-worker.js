const CACHE_NAME = 'rope-flow-v1';
const VERSION = 'v1.1'; // 이 숫자를 v1.2로 바꾸면 브라우저가 즉시 업데이트를 시작합니다.
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
