

const UrlParser = {
  /**
   * Mengembalikan URL aktif dalam format yang telah dikombinasikan.
   */
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const segments = this._splitUrl(url);
    return this._combineUrl(segments);
  },

  /**
   * Mengembalikan bagian-bagian URL aktif tanpa menggabungkannya.
   */
  parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    return this._splitUrl(url);
  },

  /**
   * Memisahkan URL berdasarkan "/"
   */
  _splitUrl(url) {
    const parts = url.split("/");
    return {
      resource: parts[1] || null,
      id: parts[2] || null,
      verb: parts[3] || null,
    };
  },

  /**
   * Menggabungkan hasil split menjadi pola rute.
   */
  _combineUrl({ resource, id, verb }) {
    return (
      (resource ? `/${resource}` : "/") +
      (id ? "/:id" : "") +
      (verb ? `/${verb}` : "")
    );
  },
};

export default UrlParser;
