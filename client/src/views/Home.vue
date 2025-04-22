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
    data() {
        return {
            username: "Guest", // Replace with dynamic username if needed
        };
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