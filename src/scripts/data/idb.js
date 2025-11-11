import { openDB } from 'idb';

const DATABASE_NAME = 'story-db';
const DATABASE_VERSION = 1;
const STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    console.log("[IndexedDB] Membuat database baru:", DATABASE_NAME);
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-date', 'createdAt');
    }
  },
});


const Idb = {
  /**
   * Mengambil semua story yang tersimpan di IndexedDB.
   * @returns {Promise<Array>}
   */
  async getAllStories() {
    try {
      return (await dbPromise).getAll(STORE_NAME);
    } catch (err) {
      console.error('[IndexedDB] Gagal mengambil data:', err);
      return [];
    }
  },

  /**
   * Mengambil satu story berdasarkan ID.
   * @param {string} id
   * @returns {Promise<Object|undefined>}
   */
  async getStory(id) {
    if (!id) return undefined;
    try {
      return (await dbPromise).get(STORE_NAME, id);
    } catch (err) {
      console.error('[IndexedDB] Gagal mengambil story:', err);
      return undefined;
    }
  },

  /**
   * Menyimpan atau memperbarui satu story ke IndexedDB.
   * @param {Object} story
   */
  async putStory(story) {
    if (!story || !story.id) {
      console.warn('[IndexedDB] Story tidak memiliki properti ID, dilewati:', story);
      return;
    }
    try {
      const db = await dbPromise;
      await db.put(STORE_NAME, story);
    } catch (err) {
      console.error('[IndexedDB] Gagal menyimpan story:', err);
    }
  },

  /**
   * Menghapus satu story berdasarkan ID.
   * @param {string} id
   */
  async deleteStory(id) {
    if (!id) return;
    try {
      const db = await dbPromise;
      await db.delete(STORE_NAME, id);
    } catch (err) {
      console.error('[IndexedDB] Gagal menghapus story:', err);
    }
  },

  /**
   * Menghapus seluruh data dalam store.
   */
  async clearAll() {
    try {
      const db = await dbPromise;
      await db.clear(STORE_NAME);
      console.info('[IndexedDB] Semua data stories telah dihapus.');
    } catch (err) {
      console.error('[IndexedDB] Gagal menghapus semua data:', err);
    }
  },
};

export default Idb;

// Tambahkan ini di akhir untuk keperluan debug manual
if (typeof window !== "undefined") {
  window.Idb = Idb;
}