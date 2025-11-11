import StoryAPI from "../data/story-api";
import Idb from "../data/idb";
import CONFIG from "../utils/config";

class HomePresenter {
  /**
   * @param {{view: Object}} param0 - Dependency injection untuk View
   */
  constructor({ view }) {
    this._view = view;
    this._stories = [];
    this._filteredStories = []; // Untuk interaktivitas filter/sort

    // View diberikan akses ke presenter
    this._view.setPresenter(this);

    // Inisialisasi data story
    this._initialize();
  }

  /**
   * Strategi network-first dengan fallback ke IndexedDB (offline)
   */
  async _initialize() {
    this._view.showLoading();

    try {
      // 1️⃣ Ambil data dari API
      const response = await StoryAPI.getStories({ location: 1, size: 30 });
      const stories = response.listStory || response;

      if (!stories || stories.length === 0) {
        throw new Error("Belum ada cerita yang tersedia untuk ditampilkan.");
      }

      // 2️⃣ Simpan ke IndexedDB
      await Idb.clearAll();
      await Promise.all(stories.map((story) => Idb.putStory(story)));

      // 3️⃣ Sync pending offline stories (Advanced)
      await this._syncPendingStories();

      // 4️⃣ Render ke View
      this._stories = stories;
      this._filteredStories = [...stories]; // Copy untuk filter
      this._view.renderStories(stories);
      this._view.renderMap(stories);

      console.info("[HomePresenter] Data berhasil dimuat dari API.");
    } catch (error) {
      console.warn("[Offline Mode] Tidak dapat memuat data dari API:", error);

      // 5️⃣ Jika gagal, ambil dari IndexedDB
      const cachedStories = await Idb.getAllStories();

      if (cachedStories && cachedStories.length > 0) {
        this._stories = cachedStories;
        this._filteredStories = [...cachedStories];
        this._view.renderStories(cachedStories);
        this._view.renderMap(cachedStories);
        this._view.showErrorMessage("Menampilkan data offline dari IndexedDB.");
      } else {
        this._view.showErrorMessage("Tidak ada data offline yang tersimpan.");
      }
    } finally {
      this._view.hideLoading();
    }
  }

  /**
   * Sync pending offline stories ke API saat online (Advanced)
   */
  async _syncPendingStories() {
    const pendingStories = await Idb.getAllStories(); // Asumsi ada flag 'pending' di story object
    const unsynced = pendingStories.filter(story => story.pending); // Tambah properti 'pending' saat offline

    for (const story of unsynced) {
      try {
        await StoryAPI.addNewStory({
          description: story.description,
          photo: story.photo,
          lat: story.lat,
          lon: story.lon
        });
        await Idb.deleteStory(story.id); // Hapus setelah sync
        console.info(`[Sync] Story ${story.id} berhasil dikirim ke API.`);
      } catch (error) {
        console.warn(`[Sync] Gagal sync story ${story.id}:`, error);
      }
    }
  }

  /**
   * Filter stories berdasarkan query (Skilled: searching)
   * @param {string} query
   */
  filterStories(query) {
    if (!query) {
      this._filteredStories = [...this._stories];
    } else {
      this._filteredStories = this._stories.filter(story =>
        story.description.toLowerCase().includes(query.toLowerCase()) ||
        story.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    this._view.renderStories(this._filteredStories);
    this._view.renderMap(this._filteredStories);
  }

  /**
   * Sort stories berdasarkan tanggal (Skilled: sorting)
   * @param {string} order - 'asc' atau 'desc'
   */
  sortStories(order = 'desc') {
    this._filteredStories.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    this._view.renderStories(this._filteredStories);
    this._view.renderMap(this._filteredStories);
  }

  /**
   * Menyorot story berdasarkan ID di list & peta.
   */
  highlightStory(storyId) {
    if (!storyId) return;
    this._view.highlightStory(storyId);
  }

  /**
   * Mengatur posisi peta ke lokasi story tertentu.
   */
  centerMapToStory(lat, lon) {
    if (!lat || !lon) return;
    this._view.setMapView(lat, lon, CONFIG.DEFAULT_MAP_ZOOM + 1);
  }
}

export default HomePresenter;