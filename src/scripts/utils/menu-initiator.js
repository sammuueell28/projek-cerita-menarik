/**
 * Utility untuk menginisialisasi interaksi menu navigasi (drawer).
 * Digunakan di layout utama aplikasi.
 */
const MenuInitiator = {
  /**
   * Mengaktifkan event listener untuk tombol dan konten.
   * @param {{button: HTMLElement, drawer: HTMLElement, content: HTMLElement}} param0
   */
  init({ button, drawer, content }) {
    if (!button || !drawer || !content) {
      console.warn("[MenuInitiator] Elemen menu tidak lengkap.");
      return;
    }

    button.addEventListener("click", (e) => this._toggleDrawer(e, drawer));

    content.addEventListener("click", (e) => this._closeDrawer(e, drawer));

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => this._closeDrawer(null, drawer));
    });
  },

  _toggleDrawer(e, drawer) {
    e.stopPropagation();
    drawer.classList.toggle("open");
  },

  _closeDrawer(e, drawer) {
    if (e) e.stopPropagation();
    drawer.classList.remove("open");
  },
};

export default MenuInitiator;
