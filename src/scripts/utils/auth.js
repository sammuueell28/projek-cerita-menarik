const AUTH_TOKEN_KEY = "authToken";

const Auth = {
  /**
   * Menyimpan token autentikasi ke localStorage.
   * @param {string} token - Token autentikasi dari server.
   */
  setAuthToken(token) {
    if (typeof token !== "string" || token.trim() === "") {
      console.error("[Auth] Token tidak valid.");
      return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  /**
   * Mengambil token autentikasi dari localStorage.
   * @returns {string|null} Token yang tersimpan, atau null jika belum login.
   */
  getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Menghapus token autentikasi (logout pengguna).
   */
  clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  /**
   * Mengecek status login pengguna.
   * @returns {boolean} True jika pengguna sudah login.
   */
  isLoggedIn() {
    return Boolean(this.getAuthToken());
  },
};

export default Auth;
