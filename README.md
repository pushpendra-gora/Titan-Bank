# 🏦 Titan Bank - Offline Android App

Aapka **Titan Bank** app bilkul aapke original HTML ke same UI aur logic ke saath **React + TypeScript + Capacitor** me convert ho chuka hai aur iska **asli Android APK (`TitanBank.apk`)** successfully build ho gaya hai.

---

## 📱 Ready-to-Install Android APK File

* **APK File Location**: [`TitanBank.apk`](file:///c:/Users/pushp/Documents/Titan%20Bank%20Folder/TitanBank.apk) *(Root folder me ready hai)*
* **File Size**: ~4.3 MB
* **Default Security PIN**: **`1506`**

### Apne Mobile Me Kaise Install Karein:
1. Apne computer se [`TitanBank.apk`](file:///c:/Users/pushp/Documents/Titan%20Bank%20Folder/TitanBank.apk) file ko apne Android phone me send karein (WhatsApp, USB Cable, Bluetooth, ya Google Drive ke zariye).
2. Mobile me file manager me jakar **TitanBank.apk** par tap karein aur **Install** par click karein.
   *(Agar pehli baar install kar rahe hain, to phone me "Install from unknown sources" allow kar dein)*.
3. App open karein aur default PIN **`1506`** daal kar enter karein!

---

## ✨ Features & User Requirements Implemented:

1. **Modern English Interface & Same Clean Logic**:
   - Complete application UI translated into clear, professional English (Balance, Income, Expenses, Money Lent, Money Borrowed, Settings, PDF Export).
   - React + TypeScript + Capacitor stack with responsive mobile design.

2. **Official Titan Bank App Icon**:
   - High-resolution Titan Bank wallet icon integrated across all platforms:
     - Android Launcher Icon (Full & Round mipmaps: MDPI, HDPI, XHDPI, XXHDPI, XXXHDPI)
     - Android Adaptive Icon (108dp foreground with white safe background)
     - App Header & PIN Security Screen
     - Web Favicon & PWA Web Manifest

3. **PIN Lock Screen (Default: 1506)**:
   - App opens with a secure Titan Bank PIN authentication screen.
   - 4-digit PIN required to unlock. Default PIN: `1506`.

4. **Settings - "Change Security PIN"**:
   - Accessible from Settings in the top right.
   - Verifies existing PIN before setting and confirming a new PIN.

5. **Settings - "Delete / Reset All Data" (PIN Protected)**:
   - Danger-zone option to reset all data safely.
   - Requires correct 4-digit PIN confirmation before data can be cleared.

6. **100% Offline & Reboot-Proof Storage**:
   - Operates 100% offline without requiring internet.
   - Dual-layer storage engine: Android Native `SharedPreferences` + `localStorage`.
   - Data persists across device reboots and app updates.

7. **Offline PDF Account Statement**:
   - Tap 📄 **Download Transactions PDF** in Settings to generate and download a clean PDF statement.

---

## 🛠️ Dubara APK Banane Ka Command (Future Rebuild)

Agar aap future me code me koi badlav karte hain aur naya APK banana chahte hain:

```powershell
npm run build:apk
```

Aur agar computer ke browser me app chalana ho:
```powershell
npm run dev
```
