// File: src/scripts/pages/about-page.js

const AboutPage = {
  // Disertakan agar konsisten dengan struktur halaman lain
  async beforeRender() {
    return true;
  },

  async render() {
    return `
      <section class="page-section container about-container">
        <h2 class="page-title">Tentang Story Map App</h2>

        <div class="about-content-wrapper">
          
          <article class="about-app-info">
            <h3 class="section-subtitle">Apa Itu Story Map App?</h3>
            <p>
              <strong>Story Map App</strong> adalah aplikasi berbasis web modern yang dirancang untuk berbagi cerita
              dan pengalaman menarik pengguna dalam bentuk tulisan, foto, serta koordinat lokasi geografis.
            </p>
            <p>
              Dibangun dengan pendekatan 
              <span class="highlight">Model–View–Presenter (MVP)</span> dan konsep 
              <span class="highlight">Single Page Application (SPA)</span>, aplikasi ini memastikan pengalaman 
              pengguna yang cepat, terstruktur, dan mudah dipelihara.
            </p>
          </article>
          
          <div class="separator"></div>

          <section class="about-technologies">
            <h3 class="section-subtitle">⚙️ Teknologi Utama yang Digunakan</h3>
            <div class="tech-grid">
              
              <div class="tech-card">
                <h4>JavaScript ES6+</h4>
                <p>Dasar pengembangan *client-side* untuk fungsionalitas interaktif.</p>
              </div>
              <div class="tech-card">
                <h4>Webpack Bundler</h4>
                <p>Mengoptimalkan aset aplikasi, memastikan performa pemuatan yang cepat.</p>
              </div>
              <div class="tech-card">
                <h4>Leaflet.js</h4>
                <p>Library peta interaktif ringan untuk menampilkan lokasi cerita secara akurat.</p>
              </div>
              <div class="tech-card">
                <h4>Story API</h4>
                <p>Sumber data utama untuk mengambil, menyimpan, dan mengelola semua cerita pengguna.</p>
              </div>
            </div>
          </section>

          <div class="separator"></div>

          <section class="about-developer">
            <h3 class="section-subtitle">👤 Tentang Pengembang</h3>
            <div class="developer-card">
              <div class="developer-avatar">
                <img src="https://via.placeholder.com/150?text=Developer" alt="Developer" class="avatar-img">
              </div>
              <div class="developer-info">
                <h4>Dicoding Academy Student</h4>
                <p>
                  Proyek ini adalah bagian dari kurikulum Dicoding Academy. Tujuannya adalah 
                  menerapkan praktik pengembangan web modern—cepat, responsif, dan *user-friendly*.
                </p>
                <a href="#/register" class="btn-primary mt-3">Mulai Berbagi Cerita</a>
              </div>
            </div>
          </section>
        </div>
      </section>
    `;
  },

  async afterRender() {
    console.log("Halaman About telah dimuat dengan sukses.");
  },
};

export default AboutPage;