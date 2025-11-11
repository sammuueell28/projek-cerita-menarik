import UrlParser from "./routes/url-parser";
import routes from "./routes/routes";
import MenuInitiator from "./utils/menu-initiator";
import Auth from "./utils/auth";
// import checkUserAuth from "./utils/check-user-auth"; // Tidak digunakan di sini, bisa dihapus.

class App {
  constructor({ content, drawer, button }) {
    this._content = content;
    this._drawer = drawer;
    this._button = button;
    this._currentRoute = null; // Tambah untuk track route saat ini dan hindari loop

    this._initialAppShell();
    this._setupHashChangeListener();
  }

  _initialAppShell() {
    MenuInitiator.init({
      button: this._button,
      drawer: this._drawer,
      content: this._content,
    });

    this._addSkipToContentLink();
    this._setupKeyboardNavigation();
    this._setupLogoutListener();
    // Panggil update navigasi segera setelah inisialisasi dan load
    this._updateNavigation();
  }

  _setupLogoutListener() {
    // Tangani klik pada tombol logout
    document.addEventListener("click", (e) => {
      // Tombol logout harus memiliki ID 'logout-button'
      if (e.target.id === "logout-button") {
        e.preventDefault();

        // Menerapkan View Transition saat logout (redirect ke login)
        document.startViewTransition(() => {
          Auth.clearAuthToken();
          this._updateNavigation();
          // Redirect ke halaman login setelah transisi selesai
          window.location.hash = routes.LOGIN.url;
        });
      }
    });
  }

  _addSkipToContentLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content"; // Ganti ke ID main content yang ada
    skipLink.textContent = "Lewati ke konten utama";
    skipLink.classList.add("skip-link");
    document.body.prepend(skipLink);
  }

  _setupKeyboardNavigation() {
    document
      .querySelectorAll("#nav-list a, .drawer-button")
      .forEach((element) => {
        element.setAttribute("tabindex", "0");
      });
  }

  /**
   * Mengganti _setupTransition manual dengan document.startViewTransition()
   */
  _setupHashChangeListener() {
    window.addEventListener("hashchange", () => {
      // Panggil renderPage di dalam startViewTransition
      this._renderPageWithTransition();
    });

    window.addEventListener("load", () => {
      // Panggil renderPage di dalam startViewTransition saat load pertama
      this._renderPageWithTransition();
    });
  }

  /**
   * Wrapper untuk memanggil _renderPage() dengan View Transition API
   * Kriteria Wajib 1: Menerapkan View Transition API
   */
  _renderPageWithTransition() {
    if (!document.startViewTransition) {
      // Fallback untuk browser yang tidak mendukung (tetapi kriteria wajib)
      this._renderPage();
      return;
    }

    // Melakukan transisi dengan View Transition API
    document.startViewTransition(() => {
      this._renderPage();
    });
  }

  async _renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const route = Object.values(routes).find((r) => r.url === url) || routes.DEFAULT;

    // Guard: Jika route sama dengan sebelumnya, skip render untuk hindari loop
    if (this._currentRoute === url) {
      return;
    }
    this._currentRoute = url;

    // --- LOGIKA AUTENTIKASI ---
    if (route) {
      // 1. Jika user sudah login, cegah akses ke Login/Register
      if (route.url === routes.LOGIN.url || route.url === routes.REGISTER.url) {
        if (Auth.isLoggedIn()) {
          this._currentRoute = routes.HOME.url; // Update route sebelum redirect
          window.location.hash = routes.HOME.url;
          return;
        }
      }

      // 2. Jika route butuh login tapi user belum login → redirect ke login
      if (route.authRequired && !Auth.isLoggedIn()) {
        this._currentRoute = routes.LOGIN.url; // Update route sebelum redirect
        window.location.hash = routes.LOGIN.url;
        return;
      }

      // 3. Render halaman
      const page = route.page;

      // Jalankan beforeRender jika ada
      if (page.beforeRender) {
        const shouldContinue = await page.beforeRender();
        if (shouldContinue === false) return;
      }

      this._content.innerHTML = await page.render();
      await page.afterRender();

      // Update tampilan navigasi (Login/Logout)
      this._updateNavigation();

      // Kriteria W4: Pastikan Skip Link Target fokus
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus();
      }
    } else {
      // Jika route tidak ditemukan (jika tidak menggunakan routes.DEFAULT)
      this._content.innerHTML = `
        <div class="container" id="main-content" tabindex="-1">
          <h1 class="page-title">404 Not Found</h1>
          <p>Halaman yang Anda cari tidak ditemukan.</p>
        </div>
      `;
    }
  }

  /**
   * Mengatur tampilan navigasi berdasarkan status login pengguna.
   * Kriteria W4: Memastikan Navigasi Auth/User disembunyikan/ditampilkan dengan benar.
   */
  _updateNavigation() {
    const isLoggedIn = Auth.isLoggedIn();

    const navList = document.getElementById("nav-list"); // Navigasi Utama (Beranda, About, Tambah Story)
    const authNavList = document.getElementById("auth-nav-list"); // Login/Register
    const userNavList = document.getElementById("user-nav-list"); // Logout

    if (!authNavList || !userNavList || !navList) {
      console.error("Navigation elements not found.");
      return;
    }

    if (isLoggedIn) {
      // Jika sudah login:
      // Tampilkan Navigasi Utama (Beranda, About, Tambah Story)
      navList.style.display = "";
      // Sembunyikan Auth Nav (Login/Register)
      authNavList.style.display = "none";
      // Tampilkan User Nav (Logout)
      userNavList.style.display = "";
    } else {
      // Jika belum login:
      // Sembunyikan Navigasi Utama (Beranda, About, Tambah Story).
      // Catatan: Ini menyembunyikan Beranda/About di desktop saat belum login.
      // Solusi yang lebih baik adalah memisahkan 'Tambah Story' dari Beranda/About di HTML.
      navList.style.display = "none";
      // Tampilkan Auth Nav (Login/Register)
      authNavList.style.display = "";
      // Sembunyikan User Nav (Logout)
      userNavList.style.display = "none";
    }
  }
}

export default App;