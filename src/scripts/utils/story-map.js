// File: src/scripts/utils/story-map.js

// Pastikan Leaflet diinstal via npm dan tersedia
import L from 'leaflet';

const StoryMap = {
    /**
     * Menginisialisasi peta Leaflet.
     * @param {object} options - Opsi peta ({ mapId, center, zoom })
     * @returns {L.Map} Objek peta Leaflet
     */
    init({ mapId, center, zoom = 13 }) {
        // Cek apakah Leaflet tersedia
        if (typeof L === 'undefined') {
            console.error('Leaflet library is not loaded.');
            return null;
        }

        // 1. Inisialisasi Peta
        const map = L.map(mapId, {
            center: center,
            zoom: zoom,
        });

        // 2. Tambahkan Layer Tile (OpenStreetMap)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        return map;
    },

    /**
     * Menambahkan marker ke peta.
     * @param {L.Map} map - Objek peta Leaflet.
     * @param {L.LatLngExpression} latlng - Koordinat marker ([lat, lng]).
     * @returns {L.Marker} Objek marker Leaflet
     */
    addMarker(map, latlng) {
        if (!map) return null;

        const marker = L.marker(latlng).addTo(map);
        return marker;
    },

    // Anda dapat menambahkan fungsi lain di sini (misalnya: clearMarkers, addPopup, dll.)
};

export default StoryMap;