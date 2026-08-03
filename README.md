# Hardware Store Manager 🛠️

Daily Sales, Returns (Motiry) & Udhar Register web application & standalone Android app powered by Node.js, Express, MongoDB Atlas Cloud, and React.

## 🚀 Features
- 📊 **Day-End Summary**: Track total daily sales, cash sales, credit (Udhar) sales, credit collections, and net cash in hand.
- 🛒 **New Sale Entry**: Record cash & credit sales with multi-item autocomplete.
- 🔄 **Return (Motiry) Entry**: Record material returns with cash refunds or credit balance adjustments.
- 👥 **Udhar Register**: Manage customer ledgers, outstanding balances, payment recordings, and batch convert credit sales to cash.
- 📱 **Standalone Android App**: Built with Capacitor / Android Studio, pre-configured for mobile phones.
- 🌐 **Server Connection Settings**: Configure your backend API server URL directly in the UI.

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas Cloud
- **Frontend**: React, Vite, Lucide Icons
- **Mobile**: Android (Capacitor WebView / Kotlin)

---

## ☁️ Deploy Backend Server for FREE (Render.com)

1. Push this repository to GitHub.
2. Sign up on [Render.com](https://render.com).
3. Create a **New Web Service** and connect this repository.
4. Render automatically uses `render.yaml`:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variable**: `MONGODB_URI` = `mongodb+srv://krishna-mobile:Mohit_123@cluster0.2zjsb9i.mongodb.net/hardware_store?retryWrites=true&w=majority`
5. Deploy and get your live server URL (e.g., `https://hardware-store-manager.onrender.com`).

---

## 📱 Android App Setup

1. Install `HardwareStoreManager.apk` on your Android phone.
2. Open the app and tap the **MongoDB Live / Offline** status pill in the top header.
3. Set your live server URL (`https://your-app.onrender.com/api`).
4. Click **Save & Connect**.

---

## 💻 Local Development

```bash
# Install dependencies
npm run install:all

# Run server (Port 5000)
npm start

# Or run frontend dev mode (Port 3000)
cd web && npm run dev
```
