import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";

const routes = {
  HOME: {
    url: "/",
    page: HomePage,
    authRequired: true, // Akses hanya untuk user yang login
  },
  ABOUT: {
    url: "/about",
    page: AboutPage,
    authRequired: true,
  },
  ADD_STORY: {
    url: "/add-story",
    page: AddStoryPage,
    authRequired: true,
  },
  LOGIN: {
    url: "/login",
    page: LoginPage,
    authRequired: false, // Halaman publik
  },
  REGISTER: {
    url: "/register",
    page: RegisterPage,
    authRequired: false,
  },
  DEFAULT: {
    url: "/",
    page: HomePage,
    authRequired: true,
  },
};

export default routes;
