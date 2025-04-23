<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <button
      class="navbar-toggler mx-2 mb-2"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div id="navbarNav" class="collapse navbar-collapse mx-2">
      <ul class="navbar-nav">
        <li v-if="!isAuthenticated" class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/login')">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/register')">Register</a>
        </li>
        <li v-if="isAuthenticated" class="nav-item">
          <a class="nav-link" href="#" @click="logout()">Logout</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/game')">Game</a>
        </li>
      </ul>
    </div>
  </nav>
  <section class="container-fluid py-4">
    <router-view />
  </section>
</template>

<script>
// @ is an alias to /src
import "bootstrap";

export default {
  name: "App",
  components: {},
  computed: {
    isAuthenticated() {
      console.log(this.$store.getters.isAuthenticated);
      return this.$store.getters.isAuthenticated;
    },
  },
  mounted() {
    const { commit, getters } = this.$store;
    const { push } = this.$router;

    commit("setAuthenticated", false);
    push(getters.isAuthenticated === true ? "/home" : "/login");
  },
  methods: {
    redirect(target) {
      const { push } = this.$router;
      console.log(this.isAuthenticated);
      push(target);
    },
    logout() {
      const { commit } = this.$store;
      const { push } = this.$router;
      fetch("/home/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.$store.getters.getUsername,
        }),
      })
        .then((response) => {
          if (response.ok) {
            commit("setAuthenticated", false);
            push("/login");
          } else {
            console.error("Logout failed");
          }
        })
    },
  },
};
</script>

<style>
@import url("bootstrap/dist/css/bootstrap.css");

html,
body {
  /* https://designs.ai/colors */
  background-color: #a7d7c5;
}
</style>