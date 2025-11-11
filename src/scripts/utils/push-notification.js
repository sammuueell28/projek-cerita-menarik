import CONFIG from './config';
import Auth from './auth';

const PushNotification = {
  async init(registration) {
    console.log('PushNotification.init called');  // Debug
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker tidak didukung.');
      return;
    }

    if (!('PushManager' in window)) {
      console.warn('Push API tidak didukung.');
      return;
    }

    // Setup button tanpa request permission otomatis
    this.setupToggleButton(registration);
  },

  async setupToggleButton(registration) {
    console.log('setupToggleButton called');  // Debug
    const toggleBtn = document.getElementById('toggle-push');
    if (!toggleBtn) {
      console.warn('Button toggle-push tidak ditemukan');  // Debug
      return;
    }

    const subscription = await registration.pushManager.getSubscription();
    toggleBtn.textContent = subscription ? 'Disable Push Notifications' : 'Enable Push Notifications';

    toggleBtn.addEventListener('click', async () => {
      console.log('Button clicked');  // Debug
      const currentSubscription = await registration.pushManager.getSubscription();
      const token = Auth.getAuthToken();
      console.log('Token:', token);  // Debug

      if (currentSubscription) {
        // Unsubscribe: Kirim ke server jika mungkin, tapi skip jika error
        if (token) {
          
          try {
            const response = await fetch(`${proxyUrl}${CONFIG.BASE_URL}/notifications/subscribe`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                endpoint: currentSubscription.endpoint
              })
            });
            if (!response.ok) {
              console.warn(`Unsubscribe gagal: ${response.status}, tapi lanjutkan`);
            } else {
              console.log('Unsubscribe berhasil dikirim ke server.');
            }
          } catch (error) {
            console.warn('Error unsubscribe, tapi lanjutkan:', error);
          }
        }
        await currentSubscription.unsubscribe();
        toggleBtn.textContent = 'Enable Push Notifications';
        console.log('Push notifications disabled');
      } else {
        // Subscribe: Request permission dan subscribe saat klik
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);  // Debug
        if (permission !== 'granted') {
          console.warn('Izin notifikasi tidak diberikan.');
          return;
        }

        if (!token) {
          console.warn('Token auth tidak ditemukan. Login dulu.');
          return;
        }

        try {
          const VAPID_PUBLIC_KEY = CONFIG.VAPID_PUBLIC_KEY;
          const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });

          console.log('Berhasil berlangganan push:', JSON.stringify(newSubscription));

          // Kirim ke server jika mungkin, tapi skip jika error (403, CORS, dll.)
          
          try {
            const response = await fetch(`${proxyUrl}${CONFIG.BASE_URL}/notifications/subscribe`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                endpoint: newSubscription.endpoint,
                keys: {
                  p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')),
                  auth: arrayBufferToBase64(newSubscription.getKey('auth'))
                }
              })
            });
            if (!response.ok) {
              console.warn(`Subscribe gagal: ${response.status}, tapi lanjutkan dengan lokal`);
            } else {
              console.log('Subscription berhasil dikirim ke server.');
            }
          } catch (error) {
            console.warn('Error subscribe, tapi lanjutkan:', error);
          }

          toggleBtn.textContent = 'Disable Push Notifications';
          console.log('Push notifications enabled');
        } catch (error) {
          console.error('Gagal subscribe:', error);
        }
      }
    });
  },
};

// Helper functions
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default PushNotification;
