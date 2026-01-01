// キャッシュの名前（更新時はここを v3, v4 と上げてください）
const CACHE_NAME = 'simple-memo-v2-cache';

// キャッシュするファイルの一覧
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // アイコンがある場合はここに追加（例: './icon-192.png'）
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// インストールイベント：ファイルをキャッシュに登録
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 新しいサービスワーカーを即座に有効化
  self.skipWaiting();
});

// アクティベートイベント：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// フェッチイベント：ネットワークよりキャッシュを優先（オフライン対応）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュがあればそれを返す、なければネットワークへ
      return response || fetch(event.request);
    })
  );
});
