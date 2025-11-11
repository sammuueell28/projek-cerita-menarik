import StoryAPI from "../data/story-api";
import Auth from "../utils/auth";
import routes from "../routes/routes";

class LoginPresenter {
  constructor({ view }) {
    this._view = view;
    this._view.setFormSubmitHandler(this._handleLogin.bind(this));
  }

  async _handleLogin({ email, password }) {
    this._view.showLoading();

    try {
      if (!email || !password) {
        throw new Error("Email dan kata sandi wajib diisi.");
      }

      const { token } = await StoryAPI.login({ email, password });

      Auth.setAuthToken(token);

      this._view.showSuccessMessage("Login berhasil! Mengarahkan ke beranda...");

      // Arahkan ke halaman utama setelah delay
      setTimeout(() => {
        window.location.hash = routes.HOME.url;
      }, 1200);
    } catch (error) {
      const message =
        error.message ||
        "Login gagal. Periksa kembali email dan kata sandi Anda.";
      this._view.showErrorMessage(message);
      console.error("[LoginPresenter] Login error:", error);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default LoginPresenter;
