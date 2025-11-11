/**
 * Utility sederhana untuk manipulasi elemen DOM.
 */

/**
 * Menampilkan elemen.
 * @param {HTMLElement} element
 */
const showElement = (element) => {
  if (element) element.style.display = "block";
};

/**
 * Menyembunyikan elemen.
 * @param {HTMLElement} element
 */
const hideElement = (element) => {
  if (element) element.style.display = "none";
};

/**
 * Mengambil elemen berdasarkan selector CSS.
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
const getElement = (selector) => document.querySelector(selector);

export { showElement, hideElement, getElement };
