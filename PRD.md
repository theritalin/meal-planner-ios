# Yemek Planlayıcı PRD (Product Requirements Document)

## Genel Bakış

Yemek Planlayıcı, kullanıcıların haftalık yemek planlarını oluşturmasına ve yönetmesine yardımcı olan bir mobil uygulamadır.

## Teknik Gereksinimler

- React Native ile geliştirilecek
- **Expo KULLANILMAYACAK** Expo kütüphanesi kullanılmayacak
- **Firebase KULLANILMAYACAK** - Tüm veriler AsyncStorage ile yerel olarak saklanacak

## Özellikler

### Yapılacaklar

- [ ] Uygulama içi satın alma hatası düzeltilecek
- [ ] İlk yüklemede ve tekrarlı kullanımda yaşanan donma sorunu çözülecek
- [ ] Reklam entegrasyonu kontrol edilecek

### Future to-do

- [ ] Başka web sitesinden tarif alma

### Tamamlananlar

- [x] Firebase kaldırıldı, AsyncStorage entegrasyonu
- [x] Temel CRUD işlemleri
- [x] Yemek listesi görüntüleme
- [x] Haftalık plan oluşturma
- [x] Rastgele plan oluşturma
- [x] Yerel veri yönetimi
- [x] Basit kullanıcı yönetimi
- [x] Sadece kullanıcı adıyla giriş yapabilme
- [x] Yemek filtreleme özelliğinin eklenmesi
- [x] UI/UX iyileştirmeleri
- [x] Yemek arama özelliğinin geliştirilmesi
- [x] Dil desteği ekle
- [x] Varsayılan yemeklerde silinebilsin
- [x] Reklam ekle
- [x] Premium seçeneği ekle
- [x] Unit testlerin yazılması
  - [x] 10 kişisel yemek ekle
  - [x] kullanıcı değiştir yemeklerin farklı databasede saklanmasını test et
  - [x] pdf çıktılarının düzgünlüğünü test et
  - [x] Reklam ve premium özelliklerini test et
  - [x] Rastgele plan dağıtımı yapılırken sadece seçilen filtreden dağıtılıp dağıtılmadığını kontrol et
- [ ] E2E testlerin yazılması
- [ ] Performans optimizasyonu
- [ ] yemekleri düzenle
- [ ] premium durum sıfırla kaldır
- [ ] logoları düzlet
- [ ] Ana ekran logo yap
