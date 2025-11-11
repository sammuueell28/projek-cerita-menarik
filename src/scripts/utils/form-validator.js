// File: src/scripts/utils/form-validator.js

/**
 * Utility untuk menambahkan validasi dasar pada form HTML.
 * Didefinisikan sebagai Class untuk digunakan dengan keyword 'new'.
 */
class FormValidator {
    /**
     * @param {HTMLFormElement} formElement
     */
    constructor(formElement) { 
        this._formElement = formElement;
        if (!formElement) return console.error("[FormValidator] Form tidak ditemukan.");
        
        formElement.setAttribute("novalidate", true);
        
        // Tambahkan event listener untuk validasi real-time
        formElement.addEventListener("input", (e) => this._validateInput(e.target));
        
        // Jalankan validasi awal untuk field yang sudah terisi
        Array.from(formElement.elements).forEach((input) => {
             if (input.willValidate && input.value) this._validateInput(input);
        });
    }

    /**
     * Metode publik untuk memvalidasi seluruh form secara manual.
     * Dipanggil di add-story-page.js saat submit.
     * @returns {boolean}
     */
    validateForm() { 
        let valid = true;
        Array.from(this._formElement.elements).forEach((input) => {
            this._validateInput(input);
            if (input.willValidate && !input.checkValidity()) valid = false;
        });
        return valid;
    }

    _validateInput(input) {
        if (!input.willValidate) return;

        // Cari span error berdasarkan ID input (misal: 'description' -> 'description-error')
        const errorSpanId = `${input.id}-error`; 
        const feedback = document.getElementById(errorSpanId); 
        const valid = input.checkValidity();

        input.classList.toggle("is-valid", valid);
        input.classList.toggle("is-invalid", !valid);

        if (feedback) {
            feedback.textContent = valid ? "" : this._getErrorMessage(input);
        }
    }

    _getErrorMessage(input) {
        if (input.validity.valueMissing) return `Bidang ${input.id} wajib diisi.`;
        if (input.validity.typeMismatch && input.type === "email")
            return "Format email tidak valid.";
        if (input.validity.tooShort)
            return `Panjang minimal ${input.minLength} karakter.`;
        // Gunakan pesan validasi bawaan browser jika tidak ada case spesifik
        return input.validationMessage; 
    }
}

export default FormValidator;