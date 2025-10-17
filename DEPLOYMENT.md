# 🚀 Plesk GitHub Deployment Rehberi

## 📋 Ön Hazırlık

### 1. GitHub Repository Hazır ✅
- Repository: https://github.com/batuhangkdmr/AuraGuzellikMerkezi
- Branch: `main`

---

## 🔧 Plesk'te Deployment Kurulumu

### Adım 1: Git Deposu Oluştur

1. **Plesk panelinde** `sitenhazirda.com` alan adına tıklayın
2. Sol menüden **"Git"** seçeneğini bulun ve tıklayın
3. **"Depo Ekle"** veya **"Add Repository"** butonuna tıklayın

### Adım 2: Repository Bilgilerini Girin

**Repository Ayarları:**
```
Repository URL: https://github.com/batuhangkdmr/AuraGuzellikMerkezi.git
Branch: main
Depo Adı: auraguzellikmerkezi (veya istediğiniz isim)
```

**Deployment Dizini:**
```
Repository dizini: /home/sitenhaz/repositories/auraguzellikmerkezi
Hedef dizin: /home/sitenhaz/httpdocs
```

### Adım 3: Deploy Actions (Önemli!)

**Build Script:**
```bash
#!/bin/bash
cd $REPO_DIR
npm install
npm run build
```

**Deploy Script:**
```bash
#!/bin/bash
# Next.js build çıktısını kopyala
rm -rf $WEBROOT/*
cp -r $REPO_DIR/.next $WEBROOT/
cp -r $REPO_DIR/public $WEBROOT/
cp -r $REPO_DIR/node_modules $WEBROOT/
cp $REPO_DIR/package.json $WEBROOT/
cp $REPO_DIR/next.config.js $WEBROOT/

# Environment variables
cp $REPO_DIR/.env.local $WEBROOT/.env.local

# PM2 ile başlat/yeniden başlat
cd $WEBROOT
pm2 delete aura-site || true
pm2 start npm --name "aura-site" -- start
pm2 save
```

### Adım 4: Environment Variables (Çevre Değişkenleri)

Plesk panelinde **"Node.js"** menüsüne gidin ve şunları ekleyin:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhpsjuy69
CLOUDINARY_API_KEY=373823899646845
CLOUDINARY_API_SECRET=g26dVOI16mQuvNU7yP2YhHqe95Y
```

### Adım 5: Node.js Yapılandırması

**Plesk Node.js Ayarları:**
- Node.js Version: **18.x veya üzeri**
- Application Mode: **Production**
- Application Root: `/home/sitenhaz/httpdocs`
- Application Startup File: `npm start` veya `node_modules/.bin/next start`
- Port: **3000** (veya Plesk'in otomatik atadığı port)

---

## 🔄 Otomatik Deployment Aktif Etme

### Webhook Kurulumu (Önerilen)

1. **Plesk Git ayarlarında** "Deploy on Push" seçeneğini aktif edin
2. **Webhook URL'sini** kopyalayın
3. **GitHub'a gidin:**
   - Repository → Settings → Webhooks → Add webhook
   - Payload URL: (Plesk'ten kopyaladığınız URL)
   - Content type: `application/json`
   - Events: `Just the push event`
   - Active: ✅

**Artık GitHub'a her push yaptığınızda otomatik deploy olacak! 🎉**

---

## 🗄️ Database Bağlantısı

### MSSQL Hosting Ayarları

`lib/repositories/BlogRepository.ts` dosyasındaki config'i hosting MSSQL bilgilerinizle güncelleyin:

```typescript
const config: sql.config = {
  server: '104.247.167.194\\MSSQLSERVER2019', // Hosting MSSQL sunucunuz
  database: 'sitenhaz_sitenhazirDb',
  user: 'sitenhaz_sitenhazir',
  password: 'H2!Zh86dzxrp@Mbw',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};
```

**Not:** Bu bilgiler zaten `lib/repositories/BlogRepository.ts` dosyasında mevcut!

---

## ✅ Test Etme

### 1. İlk Deployment
Plesk Git panelinde **"Deploy"** butonuna tıklayın.

### 2. Logs Kontrolü
Deployment loglarını kontrol edin:
- Build başarılı mı?
- Hatalar var mı?

### 3. Site Kontrolü
```
https://sitenhazirda.com
```

### 4. PM2 Process Kontrolü
SSH/Terminal erişimi varsa:
```bash
pm2 list
pm2 logs aura-site
```

---

## 🔧 Sorun Giderme

### Hata: "npm: command not found"
**Çözüm:** Plesk Node.js'i aktif edin

### Hata: "EADDRINUSE: Port already in use"
**Çözüm:** PM2'de eski process'i durdurun
```bash
pm2 delete aura-site
pm2 start npm --name "aura-site" -- start
```

### Hata: "Module not found"
**Çözüm:** node_modules'i tekrar yükleyin
```bash
cd /home/sitenhaz/httpdocs
rm -rf node_modules
npm install
```

### Database Bağlantı Hatası
**Çözüm:** 
1. Hosting MSSQL'de uzaktan erişime izin verin
2. Firewall ayarlarını kontrol edin
3. Connection string'i doğrulayın

---

## 📝 GitHub Push Workflow

### Kod değişikliği yaptıktan sonra:

```bash
git add .
git commit -m "feat: Yeni özellik eklendi"
git push origin main
```

**Webhook sayesinde otomatik deploy olacak!** 🚀

---

## 🎯 Özet

1. ✅ Plesk Git deposu bağla
2. ✅ Build/Deploy script'leri ayarla
3. ✅ Environment variables ekle
4. ✅ Node.js yapılandır
5. ✅ GitHub Webhook aktif et
6. ✅ İlk deployment'ı yap
7. ✅ Test et

**Artık her GitHub push'ında site otomatik güncellenecek!** 🎉

