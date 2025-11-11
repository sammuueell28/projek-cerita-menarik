import LoginPresenter from "../../../presenter/login-presenter";
import routes from "../../../routes/routes";
import checkUserAuth from "../../../utils/check-user-auth";
import FormValidator from "../../../utils/form-validator"; // Ini adalah Class

const LoginPage = {
  // Mengecek apakah user sudah login sebelum halaman dirender
  async beforeRender() {
    return checkUserAuth.checkAndRedirectAuth();
  },

  async render() {
    return `
      <section class="auth-section">
        <h2 class="auth-title">Masuk ke Akun</h2>
        <form id="loginForm" class="auth-form" novalidate>
          <div class="form-control">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="contoh@email.com" required />
            <span id="email-error" class="error-msg"></span>
          </div>

          <div class="form-control">
            <label for="password">Kata Sandi</label>
            <input type="password" id="password" placeholder="Masukkan kata sandi Anda" required />
            <span id="password-error" class="error-msg"></span>
          </div>

          <button type="submit" id="loginSubmit" class="btn-primary">Masuk</button>

          <div id="loadingIndicator" class="loading-text" hidden>Memproses...</div>
          <div id="statusMessage" class="status-message" hidden></div>
        </form>

        <p class="auth-switch">
          Belum punya akun? 
          <a href="#${routes.REGISTER.url}" class="link-register">Daftar di sini</a>
        </p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#loginForm");
    const loadingIndicator = document.querySelector("#loadingIndicator");
    const statusMessage = document.querySelector("#statusMessage");

    // 1. KOREKSI: Inisialisasi FormValidator sebagai Class
    new FormValidator(form);

    const view = {
      // Perluasan View agar bisa memberikan validasi real-time yang lebih baik
      validateForm: () => {
          // Karena FormValidator sudah dibuat di atas, kita perlu memastikan
          // form ini tervalidasi sebelum memanggil Presenter
          const validator = new FormValidator(form); 
          return validator.validateForm();
      },
      setFormSubmitHandler: (handler) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          
          const validator = new FormValidator(form); 
          if (!validator.validateForm()) { // Lakukan validasi saat submit
              return; 
          }

          const formData = {
            email: form.querySelector("#email").value,
            password: form.querySelector("#password").value,
          };
          handler(formData);
        });
      },
      showLoading: () => {
        loadingIndicator.hidden = false;
        statusMessage.hidden = true;
      },
      hideLoading: () => {
        loadingIndicator.hidden = true;
      },
      showSuccessMessage: (msg) => {
        statusMessage.textContent = msg;
        statusMessage.className = "status-message success";
        statusMessage.hidden = false;
        // Opsional: Redirect setelah berhasil
        setTimeout(() => {
            window.location.hash = "#/"; 
        }, 1000);
      },
      showErrorMessage: (msg) => {
        statusMessage.textContent = msg;
        statusMessage.className = "status-message error";
        statusMessage.hidden = false;
      },
    };

    new LoginPresenter({ view });
  },
};

export default LoginPage;