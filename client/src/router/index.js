import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Register from "../views/Register.vue";
import Game from "../views/Game.vue";

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
    component: Register,
  },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/game/:game_id",
    component: Game,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Setup authentication guard.
router.beforeEach((to, from, next) => {
  next();
  // if (store.state.authenticated && to.path !== "/login" && from.path !== "/register") {
  //   next();
  // } else {
  //   console.info("Unauthenticated user. Redirecting to login page.");
  //   next("/login");
  // }
});

export default router;
