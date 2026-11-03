# Sade & Modern To-Do Uygulaması (Node.js)

Node.js ve Express ile hazırlanmış, minimalist, modern ve hızlı bir yapılacaklar listesi (To-Do) uygulaması.

## Özellikler

- ✨ **Görev Ekleme:** Yeni görevleri anında listeye ekleme (Enter tuşu desteği ile).
- ✅ **Tamamlandı İşaretleme:** Göreve veya onay kutusuna tıklayarak tamamlandı / yapılmadı durumuna getirme.
- 🗑️ **Tekil Görev Silme:** İstenilen görevi listeden kaldırma.
- 🧹 **Bitenleri Toplu Silme:** Tamamlanmış olan tüm görevleri tek tıkla silme ("Bitenleri Sil" butonu).
- 🔍 **Filtreleme:** "Tümü", "Yapılacak" ve "Biten" sekmeleriyle görevleri filtreleme.
- 📊 **İlerleme Çubuğu:** Tamamlanan görevlerin yüzdesini dinamik olarak gösteren sade bir gösterge.
- 💾 **Kalıcı Veri:** Görevler `data/todos.json` dosyasında saklanır; sunucu yeniden başlatılsa bile kaybolmaz.
- 🎨 **Minimalist & Modern UI:** Sade, göz yormayan, zarif tipografi (Inter fontu) ve akıcı animasyonlar.

## Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin (daha önce yapılmadıysa):
   ```bash
   npm install
   ```

2. Sunucuyu başlatın:
   ```bash
   npm start
   ```

3. Tarayıcınızda açın:
   [http://localhost:3000](http://localhost:3000)

## Proje Yapısı

```
toDoApp_tut_gemini/
├── data/
│   └── todos.json          # Görev verilerinin saklandığı JSON dosyası
├── public/
│   ├── index.html          # Uygulama arayüzü
│   ├── style.css           # Sade ve modern stil dosyası
│   └── app.js              # İstemci tarafı API etkileşimleri ve dinamik filtreleme
├── server.js               # Node.js Express REST API sunucusu
├── package.json            # Proje ayarları ve bağımlılıkları
└── README.md               # Proje dökümantasyonu
```
