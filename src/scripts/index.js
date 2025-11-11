import "regenerator-runtime"; /* for async await transpile */
import "../styles/styles.css";
import App from "./app";
import PushNotification from './utils/push-notification';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker terdaftar: ', reg.scope);

      // Inisialisasi Push Notification
      PushNotification.init(reg);
    } catch (err) {
      console.error('Gagal mendaftar Service Worker:', err);
    }
  });
}

// Trigger push saat add story (Basic: untuk memenuhi trigger dari data story baru)
// Asumsi ada fungsi addStory di app Anda; panggil ini setelah sukses add story
// Contoh: Jika addStory adalah method di App, tambahkan di sana:
// app.addStory = async (data) => { ... setelah fetch sukses: window.dispatchEvent(new Event('storyAdded')); };
window.addEventListener('storyAdded', async () => {
  // Trigger push via API (ganti dengan endpoint push API Anda, misalnya /push)
  try {
    await fetch(`${CONFIG.BASE_URL}/push`, { // Sesuaikan endpoint API
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Cerita baru ditambahkan!' }) // Payload untuk trigger
    });
  } catch (error) {
    console.error('Gagal trigger push:', error);
  }
});

// Inisialisasi Aplikasi
const app = new App({
  button: document.querySelector("#drawer-button"),
  drawer: document.querySelector("#navigation-drawer"),
  content: document.querySelector("#main-content"),
});