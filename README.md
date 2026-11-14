# KRYPT — kendi sunucunda çalıştır

Bu arşiv, KRYPT’in tam kaynak kodunu, Node.js API sunucusunu ve bağımsız dağıtım ayarlarını içerir. Veritabanı, gönderiler, yüklenen dosyalar, özel anahtarlar ve ortam sırları arşive eklenmez.

## Gereksinimler

- Node.js 20.19 veya üzeri
- npm
- Tek sunuculu kalıcı kurulum için yazılabilir bir disk

## Node.js ile kurulum

Arşivi açtıktan sonra proje klasöründe:

```sh
npm install
npm run build
PORT=8080 KRYPT_DATA_DIR=./data npm start
```

Arayüz ve API aynı porttan sunulur. Derleme ayrıca `/source` sayfasında indirilebilen yeni bir tam-proje ZIP'i oluşturur. Uygulamayı `http://sunucu-adresi:8080` üzerinden aç.

Üretim ortamında `PORT` değerini sunucunun verdiği portla eşleştir. `KRYPT_DATA_DIR`, JSON veritabanı ile yüklemelerin saklandığı klasördür; bu klasörü kalıcı disk veya yedeklenen bir volume üzerine bağla. Değer göreli verilirse proje klasörüne göre değerlendirilir.

## Geliştirme

İki terminal aç:

```sh
# Terminal 1 — API
PORT=8787 KRYPT_DATA_DIR=./data npm run api

# Terminal 2 — Vite arayüzü; /krypt-api isteklerini API'ye yönlendirir
npm run dev
```

Geliştirme arayüzü `http://localhost:5173` adresinde açılır.

## Docker Compose

Docker ve Docker Compose kurulu sunucuda:

```sh
docker compose up -d --build
```

Uygulama `http://sunucu-adresi:8080` adresinde çalışır. Veriler `krypt-data` adlı kalıcı Docker volume'ünde tutulur. Portu değiştirmek için `.env` dosyasına `KRYPT_PORT=8088` yazabilirsin.

## Yayın öncesi önemli notlar

- Uygulama veriyi `KRYPT_DATA_DIR` içindeki JSON dosyalarında saklar. Tek bir sunucu örneği ve kalıcı disk için uygundur; birden fazla sunucu örneğiyle yatay ölçekleme için tasarlanmamıştır.
- Sunucu yeniden oluşturulsa bile verilerin korunması için data volume'ünü kalıcı tut ve düzenli yedekle.
- İnternete açık kullanımdan önce HTTPS reverse proxy kur. Bu sürümde yönetim işlemleri etkin değildir.
- ZIP arşivi yalnızca kaynak ve boş kurulum dosyalarını taşır; mevcut içerik veya sırlar içermez.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme arayüzü |
| `npm run api` | Geliştirme API sunucusu |
| `npm run build` | Üretim arayüzünü `dist/` içine derler |
| `npm start` | Üretim arayüzünü ve API'yi tek porttan sunar |
| `npm run typecheck` | TypeScript kontrolü |
