<template>
    <div class="home">
        <header>
            <h1>Welcome, {{ username }}!</h1>
        </header>
    </div>
</template>

<script>
export default {
    name: "Home",
    components: {},
    data: () => ({
        username: "",
        user_id: null,
    }),
    mounted() {
        const { getters } = this.$store;
        this.username = getters.getUsername;
        this.user_id = getters.getUserId;
        console.log("User ID:", this.user_id);
    },
};
</script>

<style scoped>
.home {
    text-align: center;
    margin-top: 20px;
}

header h1 {
    font-size: 2em;
    color: #333;
}
</style>