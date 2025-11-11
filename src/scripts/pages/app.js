import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content;
  #drawerButton;
  #navigationDrawer;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._initializeDrawer();
  }

  _initializeDrawer() {
    // Buka/tutup drawer ketika tombol diklik
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    // Tutup drawer jika user klik di luar drawer atau pada salah satu link di dalamnya
    document.body.addEventListener("click", (event) => {
      const isClickInsideDrawer = this.#navigationDrawer.contains(event.target);
      const isClickOnButton = this.#drawerButton.contains(event.target);

      if (!isClickInsideDrawer && !isClickOnButton) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = `
        <div class="container" id="main-content">
          <h2 class="page-title">404 - Halaman Tidak Ditemukan</h2>
          <p>Maaf, halaman yang Anda tuju tidak tersedia.</p>
        </div>
      `;
      return;
    }

    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;
