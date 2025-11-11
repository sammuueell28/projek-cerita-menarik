import UrlParser from "../../routes/url-parser";
import checkUserAuth from "../../utils/check-user-auth";
import FormValidator from "../../utils/form-validator"; 
import StoryMap from "../../utils/story-map"; 
import LoadingInitiator from "../../utils/loading-initiator"; 
import StoryApi from "../../data/story-api"; 
import AddStoryPresenter from "../../presenter/add-story-presenter"; 
import { compressImage } from "../../utils/image-compress";

const AddStoryPage = {
  _map: null,
  _marker: null,
  _currentStream: null,
  _mapInitialized: false,
  _hashChangeListener: null, 

  async beforeRender() {
    await checkUserAuth.checkAndRedirectGuest();

    this.stopCameraStream(); 

    if (this._hashChangeListener) {
        window.removeEventListener('hashchange', this._hashChangeListener);
        this._hashChangeListener = null;
    }
    return true;
  },

  async render() {
    return `
      <section class="page-section container">
        <h2 class="page-title">Tambah Cerita Baru</h2>
        
        <form id="addStoryForm" class="story-form" novalidate>
          
          <fieldset>
            <legend>Informasi Cerita</legend>
            
            <div class="form-control">
              <label for="description">Deskripsi Cerita *</label>
              <textarea id="description" rows="4" required></textarea>
              <span id="description-error" class="error-msg"></span>
            </div>

            <div class="form-control file-group">
              <label>Unggah Foto *</label>
              <div class="photo-upload">
                <input type="file" id="photo" accept="image/*" class="d-none" required>
                <label for="photo" class="btn-secondary">🖼️ Pilih File</label>
                <button type="button" id="cameraButton" class="btn-secondary">📸 Gunakan Kamera</button>
              </div>
              <p id="fileNameDisplay" class="file-info">Belum ada foto dipilih.</p>
              <span id="photo-error" class="error-msg"></span>
            </div>

            <div id="previewContainer" class="photo-preview-container" hidden>
              <img id="photoPreview" class="photo-preview" src="" alt="Photo Preview" style="display: none;">
            </div>

          </fieldset>

          <fieldset>
            <legend>Pilih Lokasi Cerita</legend>
            
            <div class="location-control-group">
                <p id="locationDisplay" class="location-info">Belum ada lokasi dipilih.</p>
                <button type="button" id="useCurrentLocationButton" class="btn-secondary">📍 Gunakan Lokasi Saat Ini</button>
            </div>
            
            <div class="form-control map-field">
              <div id="mapContainer" class="map-area"></div>
            </div>
          </fieldset>
          
          <button type="submit" id="submitButton" class="btn-primary" disabled>Kirim Cerita</button>
        </form>
      </section>
    `;
  },

  async afterRender() {
    this._cacheElements();
    new FormValidator(this._form); 
    this._initializeMap();
    this._setupLocationInteractions();
    this._initializeFileUpload();
    this._initializeCameraFeature();
    this._setFormSubmitHandler(); // Sudah dimodifikasi menjadi async di bawah
    this._setupExitListeners(); 
  },

  _cacheElements() {
    this._form = document.getElementById("addStoryForm");
    this._descriptionInput = document.getElementById("description");
    this._photoInput = document.getElementById("photo");
    this._submitButton = document.getElementById("submitButton");
    this._previewContainer = document.getElementById("previewContainer");
    this._photoPreview = document.getElementById("photoPreview");
    this._fileNameDisplay = document.getElementById("fileNameDisplay");
    this._locationDisplay = document.getElementById("locationDisplay");
    this._useLocationButton = document.getElementById("useCurrentLocationButton");
    this._mapContainer = document.getElementById("mapContainer");
    this._cameraButton = document.getElementById("cameraButton");
  },

  _initializeMap() {
    if (this._mapInitialized) return;

    this._map = StoryMap.init({
      mapId: "mapContainer",
      center: [-0.7893, 113.9213], 
      zoom: 5,
    });

    this._map.on("click", (e) => {
      this._updateLocation(e.latlng.lat, e.latlng.lng);
    });

    this._map.whenReady(() => {
        this._map.invalidateSize();
    });

    this._mapInitialized = true;
  },

  _setupLocationInteractions() {
    this._useLocationButton.addEventListener("click", () => {
      this.showLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.showLoading(false);
          const { latitude, longitude } = position.coords;
          this._updateLocation(latitude, longitude);
          this._map.setView([latitude, longitude], 13);
        },
        (error) => {
          this.showLoading(false);
          this.showErrorMessage(
            "Gagal mendapatkan lokasi. Pastikan izin lokasi diizinkan."
          );
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  _updateLocation(lat, lng) {
    const fixedLat = lat.toFixed(4);
    const fixedLng = lng.toFixed(4);

    if (this._marker) {
      this._marker.setLatLng([lat, lng]);
    } else {
      this._marker = StoryMap.addMarker(this._map, [lat, lng]);
    }

    this._locationDisplay.textContent = `Lokasi dipilih: (Lat: ${fixedLat}, Lon: ${fixedLng})`;
    this._form.dataset.lat = lat;
    this._form.dataset.lon = lng;
    this._validateForm();
  },

  _initializeFileUpload() {
    this._photoInput.addEventListener("change", (event) => {
      this.stopCameraStream(); 
      const file = event.target.files[0];
      if (file) {
        this._fileNameDisplay.textContent = file.name;
        this._photoPreview.src = URL.createObjectURL(file);
        this._photoPreview.style.display = "block";
        this._previewContainer.hidden = false;

        const videoElement = document.getElementById("cameraVideoPreview");
        if (videoElement) {
            this._previewContainer.replaceChildren(this._photoPreview);
        }
      } else {
        this._fileNameDisplay.textContent = "Belum ada foto dipilih.";
        this._photoPreview.src = "";
        this._photoPreview.style.display = "none";
        this._previewContainer.hidden = true;
      }
      this._validateForm();
    });
  },

  _initializeCameraFeature() {
    this._cameraButton.addEventListener("click", async (e) => {
      e.preventDefault(); 
      this.stopCameraStream(); 
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        this._currentStream = stream; 
        
        const video = document.createElement("video");
        video.id = "cameraVideoPreview"; 
        video.srcObject = stream;
        video.play();
        video.className = "camera-preview"; 
        
        const captureButton = document.createElement("button");
        captureButton.id = "captureButton";
        captureButton.textContent = "📸 Ambil Gambar";
        captureButton.className = "btn-primary mt-3"; 
        
        this._previewContainer.replaceChildren(video, captureButton);
        this._previewContainer.hidden = false;
        
        this._photoPreview.style.display = "none";

        captureButton.onclick = (event) => {
            event.preventDefault(); 
            
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            const canvas = document.createElement("canvas");
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, videoWidth, videoHeight);

            canvas.toBlob((blob) => {
                const file = new File([blob], `photo-${Date.now()}.png`, { type: "image/png" });
                
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                this._photoInput.files = dataTransfer.files;

                this._photoPreview.src = URL.createObjectURL(blob);
                this._photoPreview.style.display = "block";
                this._previewContainer.replaceChildren(this._photoPreview); 

                this._fileNameDisplay.textContent = file.name;
                this.stopCameraStream(); 
                this._validateForm();

            }, "image/png");
        };

      } catch (err) {
        this.showErrorMessage("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
        console.error("Camera access error:", err);
        this.stopCameraStream();
      }
    });
  },
  
  stopCameraStream() { 
    if (this._currentStream) {
        this._currentStream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
                track.stop();
            }
        });
        this._currentStream = null;
    }
    const videoElement = document.getElementById("cameraVideoPreview");
    if (videoElement) {
        videoElement.remove();
        if (!this._photoInput.files || this._photoInput.files.length === 0) {
             this._previewContainer.hidden = true;
        } else {
             this._previewContainer.replaceChildren(this._photoPreview);
        }
    }
  },

  _setupExitListeners() {
    const stopCameraOnHashChange = () => {
        this.stopCameraStream(); 
        console.log('Kamera dimatikan karena hash/halaman berubah (Exit Listener).');
    };

    if (this._hashChangeListener) {
        window.removeEventListener('hashchange', this._hashChangeListener);
    }

    window.addEventListener('hashchange', stopCameraOnHashChange);
    this._hashChangeListener = stopCameraOnHashChange; 
  },

  _validateForm() {
    const isDescriptionValid = this._descriptionInput.value.trim().length > 0;
    const isPhotoValid = this._photoInput.files.length > 0;
    const isLocationValid = this._form.dataset.lat && this._form.dataset.lon;

    const isFormValid = isDescriptionValid && isPhotoValid && isLocationValid;
    this._submitButton.disabled = !isFormValid;
  },

  // =======================================================
  // === MODIFIKASI: _setFormSubmitHandler UBAH KE ASYNC ===
  // =======================================================
  _setFormSubmitHandler() {
    this._form.addEventListener("submit", async (event) => { // <-- UBAH KE ASYNC
      event.preventDefault();
      
      this.showLoading(true);
      
      const formValidation = new FormValidator(this._form); 
      const isValid = formValidation.validateForm(); 

      if (!isValid) {
        this.showLoading(false);
        this.showErrorMessage("Harap lengkapi semua field yang wajib diisi.");
        return;
      }

      const originalFile = this._photoInput.files[0];
      
      try {
          // 1. KOMPRESI GAMBAR
          const compressedBlob = await compressImage(originalFile); 
          
          // 2. Buat File baru dari Blob yang terkompres
          const compressedFile = new File([compressedBlob], originalFile.name, { 
              type: "image/jpeg" 
          });
          
          const formData = new FormData();
          formData.append("description", this._descriptionInput.value);
          formData.append("photo", compressedFile); // <-- KIRIM FILE TERKOMPRES
          
          const lat = this._form.dataset.lat;
          const lon = this._form.dataset.lon;

          if (lat && lon) {
            formData.append("lat", lat);
            formData.append("lon", lon);
          }
          
          // 3. Kirim ke Presenter
          const storyPresenter = new AddStoryPresenter({
            view: this,
            storyApi: StoryApi, 
          });
          
          storyPresenter.submitStory(formData);
          
      } catch (error) {
          this.showLoading(false);
          this.showErrorMessage("Gagal memproses gambar. Cek konsol untuk detail.");
          console.error("Kompresi Gambar Gagal:", error);
      }
    });
    
    this._descriptionInput.addEventListener('input', () => this._validateForm());
    this._photoInput.addEventListener('change', () => this._validateForm());
  },
  // =======================================================
  // =======================================================

  showLoading(state) {
    LoadingInitiator.toggleLoading(state);
  },

  showSuccessMessage(message) {
    console.log("Success:", message);
    alert(message);
    this.stopCameraStream(); 
    window.location.hash = "/"; 
  },

  showErrorMessage(message) {
    console.error("Error:", message);
    alert("Error: " + message);
  },

  // Tambah method hideLoading untuk fix error
  hideLoading() {
    LoadingInitiator.toggleLoading(false);
  },
};

export default AddStoryPage;
