import StoryAPI from "../data/story-api";
import Idb from "../data/idb";

class AddStoryPresenter {
    // Menerima Class StoryAPI sebagai storyApi (karena metodenya statis)
    constructor({ view, storyApi }) {
        this._view = view;
        this._storyApi = storyApi;

        // HAPUS PANGGILAN setFormSubmitHandler karena View mengaturnya sendiri.
    }

    /**
     * Metode publik yang dipanggil oleh AddStoryPage saat form disubmit.
     * Bertanggung jawab untuk mengirim data ke API atau simpan offline.
     * @param {FormData} formData - Data form yang sudah divalidasi.
     */
    async submitStory(formData) {
        this._view.showLoading(true);
        try {
            // Ambil data dari FormData
            const description = formData.get("description");
            const photo = formData.get("photo");
            const lat = formData.get("lat");
            const lon = formData.get("lon");

            if (!description || !photo) {
                throw new Error("Deskripsi dan foto wajib diisi.");
            }

            // Coba kirim ke API
            const response = await this._storyApi.addNewStory({
                description, photo, lat, lon
            });

            if (response.error) {
                 throw new Error(response.message || "Gagal menambahkan cerita dari server.");
            }

            this._view.showSuccessMessage("Cerita berhasil ditambahkan!");

        } catch (err) {
            console.warn("[Offline Mode] Gagal kirim ke API, simpan offline:", err);

            // Simpan ke IndexedDB sebagai pending (Advanced: offline save)
            const offlineStory = {
                id: `offline-${Date.now()}`, // ID unik untuk offline
                description,
                photo, // Asumsi photo adalah File, tapi IndexedDB bisa simpan blob
                lat: lat ? parseFloat(lat) : null,
                lon: lon ? parseFloat(lon) : null,
                createdAt: new Date().toISOString(),
                pending: true // Flag untuk sync nanti
            };

            await Idb.putStory(offlineStory);
            this._view.showSuccessMessage("Cerita disimpan offline. Akan dikirim saat online.");
        } finally {
            this._view.hideLoading(false);
        }
    }
}

export default AddStoryPresenter;