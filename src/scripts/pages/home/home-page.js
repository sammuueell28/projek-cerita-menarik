import HomePresenter from "../../presenter/home-presenter";
import StoryAPI from "../../data/story-api";
import checkUserAuth from "../../utils/check-user-auth"; // Path sudah disesuaikan
import L from "leaflet";
import CONFIG from "../../utils/config";

// Konfigurasi Leaflet agar ikon marker dimuat dengan benar oleh Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const HomePage = {
  // Pastikan pengguna sudah login sebelum merender halaman
  async beforeRender() {
    return checkUserAuth.checkAndRedirectGuest(); // Redirect ke Login jika belum login
  },

  async render() {
    return `
      <section class="page-section container home-section">
        <div class="page-header-container">
          <h2 class="page-title">Buatlah Cerita Baru Anda Disini!</h2>
          <a href="#/add-story" id="addStoryButton" class="btn-primary" aria-label="Tambah Cerita Baru">
              <i class="bi bi-plus-lg"></i> Tambah Story
          </a>
        </div>
        
        <!-- Tambah UI untuk Skilled: Search dan Sort -->
        <div class="filter-container">
          <input type="text" id="search-input" placeholder="Cari cerita..." class="search-input">
          <button id="sort-button" class="btn-secondary">Sort by Date (Newest)</button>
        </div>
        
        <div id="loading-indicator" class="loading-indicator" style="display: none;">Memuat data...</div>
        <div id="error-message" class="error-message" style="display: none;"></div>
        
        <div class="story-layout">
          <div class="story-list-container">
            <h3>Daftar Story</h3>
            <ul id="story-list" class="story-list" role="list">
              </ul>
          </div>
          
          <div class="story-map-container">
            <h3>Peta Lokasi Story</h3>
            <div id="map" class="map-container" tabindex="0" role="region" aria-label="Peta lokasi cerita"></div>
            
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    this._initViewElements();
    
    // 1. Inisialisasi Presenter dengan View (this) dan API Service
    this._presenter = new HomePresenter({
      view: this,
      api: StoryAPI, 
    });

    // Tambah event listener untuk Skilled
    this._setupInteractivity();

    this._setupLayerControl();
  },

  // === View Initialization & Element Caching ===
  _initViewElements() {
    this._loadingIndicator = document.getElementById("loading-indicator");
    this._errorMessage = document.getElementById("error-message");
    this._storyListElement = document.getElementById("story-list");
    this._mapElement = document.getElementById("map");
    this._map = null;
    this._markers = [];
  },

  // Tambah setup untuk interaktivitas Skilled
  _setupInteractivity() {
    const searchInput = document.getElementById("search-input");
    const sortButton = document.getElementById("sort-button");

    searchInput.addEventListener("input", (e) => {
      this._presenter.filterStories(e.target.value);
    });

    sortButton.addEventListener("click", () => {
      const currentOrder = sortButton.textContent.includes("Newest") ? "asc" : "desc";
      this._presenter.sortStories(currentOrder);
      sortButton.textContent = currentOrder === "asc" ? "Sort by Date (Oldest)" : "Sort by Date (Newest)";
    });
  },

  setPresenter(presenter) {
    this._presenter = presenter;
  },

  // --- View Methods (Dipanggil oleh Presenter) ---
  showLoading() {
    this._loadingIndicator.style.display = "block";
    this._errorMessage.style.display = "none";
  },

  hideLoading() {
    this._loadingIndicator.style.display = "none";
  },

  showErrorMessage(message) {
    this._errorMessage.textContent = message;
    this._errorMessage.style.display = "block";
    this._storyListElement.innerHTML = `<li class="col-span-full text-center">${message}</li>`;
    if(this._map) this._map.remove(); 
  },

  // Metode untuk merender daftar cerita
  renderStories(stories) {
    this._storyListElement.innerHTML = "";
    if (stories.length === 0) {
      this._storyListElement.innerHTML = `<li class="text-center">Belum ada cerita yang tersedia.</li>`;
      return;
    }
    
    stories.forEach((story) => {
      const storyItem = document.createElement("li");
      storyItem.className = "story-item";
      storyItem.setAttribute("tabindex", "0");
      storyItem.setAttribute("data-id", story.id);

      // Event click memanggil Presenter
      storyItem.addEventListener("click", () => {
        if (story.lat && story.lon) {
          this._presenter.highlightStory(story.id);
          this._presenter.centerMapToStory(story.lat, story.lon);
        }
      });

      storyItem.innerHTML = `
        <article class="story-card">
          <img src="${story.photoUrl}" alt="Foto ${story.name}" class="story-img" loading="lazy">
          <div class="story-content">
            <h4 class="story-name">${story.name}</h4>
            <p class="story-description">${story.description.substring(0, 100)}...</p>
            <time class="story-date" datetime="${story.createdAt}">${new Date(
              story.createdAt
            ).toLocaleDateString()}</time>
            ${
              story.lat && story.lon
                ? '<span class="story-location">🌍 Lokasi Tersedia</span>'
                : ""
            }
          </div>
        </article>
      `;
      this._storyListElement.appendChild(storyItem);
    });
  },

  // Metode untuk merender peta dan marker
  renderMap(stories) {
    if (this._map) {
      this._map.remove();
    }

    this._map = L.map(this._mapElement).setView(
      [CONFIG.DEFAULT_MAP_LATITUDE, CONFIG.DEFAULT_MAP_LONGITUDE],
      CONFIG.DEFAULT_MAP_ZOOM
    );
    this._createMapLayers();
    this._osmLayer.addTo(this._map);

    this._markers = stories
      .filter((story) => story.lat && story.lon)
      .map((story) => {
        const marker = L.marker([story.lat, story.lon], { id: story.id })
          .bindPopup(`
            <strong>${story.name}</strong><br>
            ${story.description.substring(0, 50)}...
            <br>
            <img src="${story.photoUrl}" alt="Gambar Story ${story.name}" style="width: 100px; height: auto;">
          `);

        marker.on("click", () => {
          this._presenter.highlightStory(story.id);
        });

        return marker;
      });

    const markerGroup = L.featureGroup(this._markers);
    markerGroup.addTo(this._map);

    if (this._markers.length > 0) {
      this._map.fitBounds(markerGroup.getBounds());
    }
  },
  
  // Metode untuk highlight item di list dan marker di peta
  highlightStory(storyId) {
    // 1. Highlight List Item
    document.querySelectorAll(".story-item").forEach((item) => {
      item.classList.remove("highlighted");
      if (item.dataset.id === storyId) {
        item.classList.add("highlighted");
        item.focus();
      }
    });

    // 2. Open Marker Popup
    this._markers.forEach((marker) => {
      if (marker.options.id === storyId) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    });
  },

  // Metode untuk mengatur view peta (dipanggil oleh Presenter)
  setMapView(lat, lon, zoom) {
    if (this._map) {
      this._map.setView([lat, lon], zoom);
    }
  },

  // --- Map Layer Management ---
  _baseLayers: null,
  _mapboxLayer: null,
  _osmLayer: null,

  _setupLayerControl() {
    const radioButtons = document.querySelectorAll('input[name="map-layer"]');
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        const selectedLayer = event.target.value;
        this._changeMapLayer(selectedLayer);
      });
    });
    this._createMapLayers();
  },

  _createMapLayers() {
    this._osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    this._mapboxLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${CONFIG.MAPBOX_ACCESS_TOKEN}`,
      {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        tileSize: 512,
        zoomOffset: -1,
      }
    );

    this._baseLayers = {
      osm: this._osmLayer,
      mapbox: this._mapboxLayer,
    };
  },

  _changeMapLayer(layerName) {
    if (this._map) {
      // Hapus layer yang sedang aktif
      Object.values(this._baseLayers).forEach((layer) => {
        if (this._map.hasLayer(layer)) {
          this._map.removeLayer(layer);
        }
      });

      // Tambahkan layer yang baru dipilih
      const newLayer = this._baseLayers[layerName];
      if (newLayer) {
        this._map.addLayer(newLayer);
      }
    }
  },
};

export default HomePage;