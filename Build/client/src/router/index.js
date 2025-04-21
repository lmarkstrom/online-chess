import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";

const routes = [
  {
    path: "/",
    component: Login,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/register",
    component: Register
  },
  {
    path: "/home",
    component: Home,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Setup authentication guard.
router.beforeEach((to, from, next) => {
  if (store.state.authenticated && to.path !== "/login" && from.path !== "/register") {
    next();
  } else {
    console.info("Unauthenticated user. Redirecting to login page.");
    next("/login");
  }
});

export default router;
