<template>
    <div class="register">
        <h1>Register</h1>
        <form @submit.prevent="handleRegister()">
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
            const { push } = this.$router;
            
            if(!this.form.username || !this.form.password || !this.form.passwordcheck) {
                alert("Please fill in all fields.");
                return;
            }
            const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;
            
            if (this.form.password !== this.form.passwordcheck) {
                alert("Passwords do not match!");
                return;
            }else if (!(regex.test(this.form.password) && regex.test(this.form.passwordcheck))) {
                alert("Password does not match regex lol");
                return;
            }
            
            try { 
                await fetch("/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.form),
                }).then((res) => res.json()).then((data) => {
            
                    console.log("Registration successful:", data);
                    push("/home");
                   
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