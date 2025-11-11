/**
 * Konfigurasi utama aplikasi.
 * Berisi API endpoint, kunci publik, dan pengaturan peta default.
 */
const CONFIG = {
  STORY_API_BASE_URL: "https://story-api.dicoding.dev/v1",
  VAPID_PUBLIC_KEY: "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk",

  // Gunakan OpenStreetMap (gratis) atau ganti dengan Mapbox token Anda
  MAPBOX_ACCESS_TOKEN: "YOUR_MAPBOX_ACCESS_TOKEN_HERE",

  // Koordinat default (Surabaya)
  DEFAULT_MAP_LATITUDE: -7.257472,
  DEFAULT_MAP_LONGITUDE: 112.75209,
  DEFAULT_MAP_ZOOM: 12,
  BASE_URL: "https://story-api.dicoding.dev/v1",
};

export default CONFIG;
