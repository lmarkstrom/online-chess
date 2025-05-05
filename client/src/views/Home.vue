<template>
    <div class="home">
        <header>
            <h1 class="display-5">Welcome, {{ username }}!</h1>
        </header>
        <div class="row">
            <div class="col-md-6 mb-4">
                <h1 class="display-5 mb-4">Join games</h1>
                <div v-if="open_games.length === 0" class="text-muted">No open games yet.</div>
                <div v-for="game in open_games" :key="game.id" class="card mb-3 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title fw-bold">{{ game.game_name }}</h5>
                    <p class="card-text mb-1">Host: <strong>{{ game.host }}</strong></p>
                    <p class="card-text mb-2">Status: {{ getStatus(game) }}</p>
                    <a :href="'/game/' + game.id" class="btn btn-outline-primary btn-sm">Join</a>
                </div>
                </div>
            </div>
            <div class="col-md-6">
                <h1 class="display-5 mb-4">Create new Game</h1>
                <form @submit.prevent="createGame()">
                    <input
                        id="gameName"
                        v-model="game_name"
                        type="text"
                        class="form-control"
                        placeholder="Enter game name..."
                        required
                    />
                    <button type="submit" class="btn btn-dark float-end">Create</button>
                </form>
            </div>
      </div>
    </div>
</template>

<script>
import { io } from "socket.io-client";

const socket = io("http://localhost:8989");

export default {
    name: "Home",
    components: {},
    data: () => ({
        username: "",
        user_id: null,
        open_games: [],
        game_name: "",
    }),
    mounted() {
        const { getters } = this.$store;
        this.username = getters.getUsername;
        this.user_id = getters.getUserId;
        console.log("User ID:", this.user_id);
        fetch("/home/fetchGames", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: this.user_id}),
        }).then((res) => res.json()).then((data) => {
            this.open_games = data;
            console.log("Open games:", this.open_games);
        });
        socket.on("newGame", (game) => {
            this.$nextTick(() => {
                this.open_games.push(game);
            });
            console.log("New game created:", game);
        });
    },
    methods: {
        async createGame() {
            const { push } = this.$router;
            const { commit } = this.$store;
            console.log("Creates new game")
            const id = await fetch("/home/newGame", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_1: this.user_id, username: this.username, game_name: this.game_name }),
                }).then((res) => res.json()).then((data) => {
                    console.log("Game created:", data);
                    return data.game_id;
                });
            commit("setGameId", id);
            push(`/game/${id}`);
        },
        getStatus(game) {
            if (game.user_2 === null) {
                return "Waiting for player 2...";
            } else return "Game started!";
        },
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