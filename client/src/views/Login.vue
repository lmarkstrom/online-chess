<template>
  <section class="container-fluid py-4">
    <div class="row">
      <div class="col"></div>
      <form class="col" @submit.prevent="authenticate()">
        <label for="username" class="form-label h4">Please sign in!</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          placeholder="any username..."
          required
        />
        <input
          id="password"
          v-model="password"
          type="text"
          class="form-control"
          placeholder="type 1234"
          required
        />
        <button type="submit" class="btn btn-dark mt-4 float-end">OK</button>
        <p class="text-danger">{{ msg }}</p>
      </form>
      <div class="col"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: "LoginView",
  components: {},
  data: () => ({
    username: "",
    password: "",
    msg: "",
  }),
  methods: {
    async authenticate() {
      console.log(this.username, this.password);
      const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;
      if (!(regex.test(this.password) )) { // && regex.test(this.username)
        this.msg = "Bad credentials!";
        return;
      }
      const { commit, getters } = this.$store;
      const { push } = this.$router;
      await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: this.username, password: this.password }),
      }).then((res) => res.json()).then((data) => {
        if (data !== -1) {
          commit("setAuthenticated", true);
          commit("setUsername", this.username);
          commit("setUserId", data);
        } else {
          this.msg = "Bad credentials!";
        }
      });
      push(getters.isAuthenticated === true ? "/home" : "/login");
    },
  },
};
</script>