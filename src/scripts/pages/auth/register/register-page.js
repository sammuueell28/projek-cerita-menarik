import RegisterPresenter from "../../../presenter/register-presenter";
import routes from "../../../routes/routes";
import checkUserAuth from "../../../utils/check-user-auth";
import FormValidator from "../../../utils/form-validator";

const RegisterPage = {
  // Mengecek apakah pengguna sudah login sebelum halaman dirender
  async beforeRender() {
    return checkUserAuth.checkAndRedirectAuth();
  },

  async render() {
    return `
      <section class="auth-section">
        <h2 class="auth-title">Buat Akun Baru</h2>
        <form id="registerForm" class="auth-form" novalidate>
          <div class="form-control">
            <label for="name">Nama Lengkap</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Masukkan nama Anda" 
              required 
            />
            <span class="error-msg" id="name-error" data-for="name"></span>
          </div>

          <div class="form-control">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="contoh@email.com" 
              required 
            />
            <span class="error-msg" id="email-error" data-for="email"></span>
          </div>

          <div class="form-control">
            <label for="password">Kata Sandi</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Minimal 8 karakter" 
              minlength="8" 
              required 
            />
            <span class="error-msg" id="password-error" data-for="password"></span>
          </div>

          <button type="submit" class="btn-primary" id="registerSubmit">Daftar</button>

          <div id="loadingIndicator" class="loading-text" hidden>Memproses...</div>
          <div id="statusMessage" class="status-message" hidden></div>
        </form>

        <p class="auth-switch">
          Sudah punya akun? 
          <a href="${routes.LOGIN.url}" class="link-login">Masuk di sini</a>
        </p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#registerForm");
    const loadingIndicator = document.querySelector("#loadingIndicator");
    const statusMessage = document.querySelector("#statusMessage");

    // Interface view untuk presenter
    const view = {
      setFormSubmitHandler: (handler) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();

          // Validasi manual sebelum submit
          const validator = new FormValidator(form);
          const isValid = validator.validateForm();
          if (!isValid) return;

          const formData = {
            name: form.querySelector("#name").value.trim(),
            email: form.querySelector("#email").value.trim(),
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
      },
      showErrorMessage: (msg) => {
        statusMessage.textContent = msg;
        statusMessage.className = "status-message error";
        statusMessage.hidden = false;
      },
    };

    // Inisialisasi presenter
    new RegisterPresenter({ view });

    // Inisialisasi validator form (real-time validation)
    new FormValidator(form);
  },
};

export default RegisterPage;
