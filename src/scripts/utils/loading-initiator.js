// File: src/scripts/utils/loading-initiator.js

const LoadingInitiator = {
  // Asumsi ID elemen utama tempat indikator loading/overlay akan diletakkan.
  // Ganti 'mainContent' jika ID elemen utama Anda berbeda.
  _targetElement: document.getElementById('mainContent') || document.body, 
  _loadingIndicatorClass: 'app-loading-active', 

  /**
   * Mengaktifkan atau menonaktifkan indikator loading.
   * @param {boolean} state - true untuk tampilkan loading, false untuk sembunyikan.
   */
  toggleLoading(state) {
    if (state) {
      this._showLoading();
    } else {
      this._hideLoading();
    }
  },

  _showLoading() {
    this._targetElement.classList.add(this._loadingIndicatorClass);
    // Tambahkan logika untuk menampilkan spinner/overlay jika ada
  },
  
  _hideLoading() {
    this._targetElement.classList.remove(this._loadingIndicatorClass);
    // Tambahkan logika untuk menyembunyikan spinner/overlay jika ada
  },
};

export default LoadingInitiator;