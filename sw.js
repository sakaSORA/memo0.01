const CACHE_NAME = 'kioku-v15'; // バージョンを変更（更新時はここを変える）
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// インストール処理
self.addEventListener('install', (event) => {
  // 新しいSWをすぐに待機状態からアクティブにする（更新を即座に反映させるため）
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティベート時の処理（ここで古いキャッシュを消す）
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 現在のバージョン(v14)以外は全て削除
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // ページをコントロール下に置く
      return self.clients.claim();
    })
  );
});

// リソース取得時の戦略（ネットワーク優先 -> 失敗したらキャッシュ）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワーク成功時：レスポンスを返すと同時に、次回のためにキャッシュを更新（オプション）
        // 今回はシンプルにネットワーク優先のみとします
        return response;
      })
      .catch(() => {
        // オフライン時：キャッシュから返す
        return caches.match(event.request);
      })
  );
});
