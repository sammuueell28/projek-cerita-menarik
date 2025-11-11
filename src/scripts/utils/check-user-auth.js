import Auth from "./auth";
import routes from "../routes/routes";

/**
 * Utility untuk validasi dan pengalihan pengguna
 * berdasarkan status autentikasi mereka.
 */
const checkUserAuth = {
  /**
   * Mengecek jika user sudah login, maka redirect ke Home.
   * Digunakan di halaman Login/Register.
   */
  checkAndRedirectAuth() {
    if (Auth.isLoggedIn()) {
      window.location.hash = routes.HOME.url;
      return false; // Hentikan proses render
    }
    return true;
  },

  /**
   * Mengecek jika user belum login, maka redirect ke Login.
   * Digunakan di halaman yang memerlukan autentikasi (Home, Add Story, About).
   */
  checkAndRedirectGuest() {
    if (!Auth.isLoggedIn()) {
      window.location.hash = routes.LOGIN.url;
      return false;
    }
    return true;
  },
};

export default checkUserAuth;
