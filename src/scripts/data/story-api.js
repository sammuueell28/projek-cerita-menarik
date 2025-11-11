import CONFIG from "../utils/config";
import Auth from "../utils/auth"; // Diperlukan untuk mengambil token

class StoryAPI {
  /**
   * Metode internal untuk menangani respons fetch (JSON) dan melempar error.
   * Dipanggil secara internal oleh semua metode API.
   * @param {Response} response
   * @returns {Promise<any>}
   */
  static async _handleResponse(response) {
    // 1. Cek kode status HTTP terlebih dahulu
    if (!response.ok) {
      // Coba baca pesan JSON untuk mendapatkan detail error dari server
      try {
        const errorJson = await response.json();
        throw new Error(
          errorJson.message ||
            `Gagal menghubungi API: ${response.status} ${response.statusText}`
        );
      } catch (e) {
        // Jika gagal parse JSON (misal server down atau 404), lempar error HTTP
        throw new Error(
          `Gagal menghubungi API: ${response.status} ${response.statusText}`
        );
      }
    }

    const responseJson = await response.json();

    // 2. Cek properti 'error' dari API (khusus Dicoding API)
    if (responseJson.error) {
      throw new Error(
        responseJson.message ||
          "Terjadi kesalahan saat berkomunikasi dengan server."
      );
    }

    return responseJson; // Mengembalikan seluruh objek respons JSON
  }

  // =============================
  // ==== FUNGSI AUTHENTIKASI ====
  // =============================

  /**
   * Melakukan registrasi pengguna baru.
   * @param {{name: string, email: string, password: string}} userData
   * @returns {Promise<any>}
   */
  static async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.STORY_API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    return StoryAPI._handleResponse(response);
  }

  /**
   * Melakukan login pengguna dan mendapatkan token.
   * @param {{email: string, password: string}} credentials
   * @returns {Promise<{token: string}>}
   */
  static async login({ email, password }) {
    const response = await fetch(`${CONFIG.STORY_API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await StoryAPI._handleResponse(response);

    if (data.loginResult && data.loginResult.token) {
      return { token: data.loginResult.token };
    }

    throw new Error(
      "Login berhasil, tetapi token tidak ditemukan dalam respons."
    );
  }

  // =========================
  // ====== FUNGSI STORY =====
  // =========================

  /**
   * Mendapatkan daftar cerita.
   * Menggunakan token jika tersedia (atau mengambil dari Auth).
   * @param {{page?: number, size?: number, location?: number}} params
   * @returns {Promise<any>}
   */
  static async getStories({
    page = 1,
    size = 10,
    location = 0, // 0 = semua, 1 = hanya dengan lokasi
  } = {}) {
    const token = Auth.getAuthToken();

    const url = new URL(`${CONFIG.STORY_API_BASE_URL}/stories`);
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);
    url.searchParams.set("location", location);

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // Perbaiki syntax
    }
    // Jika tidak ada token, izinkan request tanpa auth (untuk public stories)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    return StoryAPI._handleResponse(response);
  }

  /**
   * Menambahkan cerita baru.
   * @param {{description: string, photo: File, lat?: number, lon?: number}} storyData
   * @returns {Promise<any>}
   */
  static async addNewStory({ description, photo, lat, lon }) {
    const token = Auth.getAuthToken();

    if (!token) {
      throw new Error("Anda harus login untuk menambahkan cerita.");
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${CONFIG.STORY_API_BASE_URL}/stories`, {
      method: "POST",
      headers,
      body: formData,
    });

    return StoryAPI._handleResponse(response);
  }
}

export default StoryAPI;