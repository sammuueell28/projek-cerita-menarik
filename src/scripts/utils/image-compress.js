// File: src/scripts/utils/image-helper.js

const MAX_WIDTH = 1024; // Contoh batas lebar maksimum
const MAX_HEIGHT = 768; // Contoh batas tinggi maksimum
const COMPRESSION_QUALITY = 0.8; // Kualitas kompresi JPEG (0.0 hingga 1.0)

/**
 * Mengubah ukuran gambar dan mengompresnya menjadi Blob, 
 * memastikan ukuran file di bawah batas API.
 * @param {File} file - Objek File yang akan dikompres.
 * @returns {Promise<Blob>} - Promise yang me-resolve Blob dari gambar yang terkompres.
 */
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Hitung rasio untuk memastikan gambar tidak melebihi batas MAX_WIDTH/MAX_HEIGHT
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Konversi canvas ke Blob dengan kualitas kompresi yang lebih rendah (JPEG)
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, "image/jpeg", COMPRESSION_QUALITY); // Penting: Kompresi JPEG
            };
        };
    });
}

export { compressImage };