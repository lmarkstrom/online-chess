<template>
  <div class="register">
    <h1>Register</h1>
    <form @submit.prevent="handleRegister()">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="form.username" type="text" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required />
      </div>
      <div class="form-group">
        <label for="passwordcheck">Repeat Password</label>
        <input
          id="passwordcheck"
          v-model="form.passwordcheck"
          type="password"
          required
        />
      </div>
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "RegisterPage",
  data() {
    return {
      form: {
        username: "",
        password: "",
        passwordcheck: "",
        errorMessage: "",
      },
    };
  },
  methods: {
    async handleRegister() {
      if (
        !this.form.username ||
        !this.form.password ||
        !this.form.passwordcheck
      ) {
        alert("Please fill in all fields.");
        return;
      }
      const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;

      if (this.form.password !== this.form.passwordcheck) {
        alert("Passwords do not match!");
        return;
      }
      if (
        !(regex.test(this.form.password) && regex.test(this.form.passwordcheck))
      ) {
        alert("Password does not match regex lol")
        return;
      }

      const { commit } = this.$store;
      const { push } = this.$router;

      try {
        await fetch("/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log("Registration successful:", data); // Now prints the full object
              commit("setAuthenticated", true);
              commit("setUsername", data.username);
              commit("setUserId", data.userId);
              push("/home");
            } else {
              console.error("Registration failed:", data.error);
              alert("Registration failed");
            }
          });
      } catch (error) {
        console.error("Error during registration:", error);
      }
    },
  },
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
