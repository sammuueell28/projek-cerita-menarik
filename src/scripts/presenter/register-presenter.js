import StoryAPI from "../data/story-api";
import routes from "../routes/routes";

class RegisterPresenter {
  constructor({ view }) {
    this._view = view;
    this._view.setFormSubmitHandler(this._handleSubmit.bind(this));
  }

  async _handleSubmit(formData) {
    this._view.showLoading();

    try {
      const { name, email, password } = formData;

      // Validasi: Pastikan semua field diisi
      if (!name || !email || !password) {
        throw new Error("Nama, Email, dan Password harus diisi.");
      }

      // Panggil API Register
      await StoryAPI.register({ name, email, password });

      // Tampilkan pesan sukses
      this._view.showSuccessMessage(
        "Registrasi berhasil! Anda akan diarahkan ke halaman Login untuk masuk."
      );

      // Redirect ke halaman Login setelah 1 detik
      setTimeout(() => {
        window.location.hash = routes.LOGIN.url;
      }, 1000);
    } catch (error) {
      // Tangani error dengan pesan yang lebih informatif
      const errorMessage =
        error.message ||
        "Registrasi gagal. Silakan coba dengan email lain atau cek koneksi Anda.";
      this._view.showErrorMessage(errorMessage);
      console.error("Register Error:", error);
    } finally {
      this._view.hideLoading();
    }
  }
}

export default RegisterPresenter;
