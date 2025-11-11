import CONFIG from "../utils/config";

class API {
  static async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.STORY_API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  }

  // Implementasi Login jika diperlukan
  // static async login(...) { ... }
}

export default API;
