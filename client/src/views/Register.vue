<template>
    <div class="register">
        <h1>Register</h1>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="username">Username</label>
                <input
                    type="text"
                    id="username"
                    v-model="form.username"
                    required
                />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    v-model="form.password"
                    required
                />
            </div>
            <div class="form-group">
                <label for="passwordcheck">Repeat Password</label>
                <input
                    type="password"
                    id="passwordcheck"
                    v-model="form.passwordcheck"
                    required
                />
            </div>
            <button type="submit">Register</button>
        </form>
    </div>
</template>

<script>
export default {
    name: "Register",
    data() {
        return {
            form: {
                username: "",
                password: "",
                passwordcheck: "",
            },
        };
    },
    methods: {
        async handleRegister() {
            try {
                // Replace with your API call logic
                const response = await fetch("/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.form),
                });

                if (!response.ok) {
                    throw new Error("Registration failed");
                }

                const data = await response.json();
                console.log("Registration successful:", data);
                pushScopeId("/home");
            } catch (error) {
                console.error("Error during registration:", error);
            }
        },
        async authenticate() {
            console.log(this.username, this.password);
            const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;
            if (!(regex.test(this.password) && regex.test(this.username) && regex.test(this.passwordcheck))) {
                this.msg = "Password and or username does not match regex lol";
                return;
            }
            if (this.password !== this.passwordcheck) {
                this.msg = "Passwords do not match!";
                return;
            }

            const { commit, getters } = this.$store;
            const { push } = this.$router;
            await fetch("/register", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: this.username, password: this.password }),
            }).then((res) => res.json()).then((data) => {
                if (data !== 0) {
                commit("setAuthenticated", true);
                commit("setUsername", this.username);
                commit("setUserId", data);
                } else {
                this.msg = "Username already taken!";
                }
            });
            push(getters.isAuthenticated === true ? "/home" : "/register");
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