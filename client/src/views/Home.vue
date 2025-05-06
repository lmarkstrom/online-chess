<template>
    <div class="home">
        <header>
            <h1 class="display-5">Welcome, {{ username }}!</h1>
        </header>
        <div class="row">
            <div class="col-md-4 mb-4">
                <h2 class="display-6 mb-4">Join games</h2>
                <div v-if="open_games.length === 0" class="text-muted">No open games</div>
                <div v-for="game in openGames" :key="game.id" class="card mb-3 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title fw-bold">{{ game.game_name }}</h5>
                    <p class="card-text mb-1">Host: <strong>{{ game.host }}</strong></p>
                    <p class="card-text mb-2">Status: {{ getStatus(game) }}</p>
                    <a :href="'/game/' + game.id" class="btn btn-outline-primary btn-sm" @click="joinGame(game.id)">Join</a>
                </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <h2 class="display-6 mb-4">My games</h2>
                <div v-if="open_games.length === 0" class="text-muted">No own games</div>
                <div v-for="game in myGames" :key="game.id" class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">{{ game.game_name }}</h5>
                        <p class="card-text mb-1">Host: <strong>{{ game.host }}</strong></p>
                        <p class="card-text mb-2">Status: {{ getStatus(game) }}</p>
                         <a class="btn btn-outline-primary btn-sm">Join</a> <!--:href="'/game/'+ game.id" -->
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <h2 class="display-6 mb-4">Create new Game</h2>
                <form @submit.prevent="createGame()">
                    <input
                        id="gameName"
                        v-model="game_name"
                        type="text"
                        class="form-control"
                        placeholder="Enter game name..."
                        required
                    />
                    <button type="submit" class="btn btn-dark float-end mt-2">Create</button>
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
    computed: {
    openGames() {
      return this.open_games.filter(
        game => game.user_2 === null && game.user_1 !== this.user_id
      );
    },
    myGames() {
      return this.open_games.filter(
        game => game.user_1 === this.user_id || game.user_2 === this.user_id
      );
    },
  },
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
        joinGame(game_id) {
            const { push } = this.$router;
            const { commit } = this.$store;
            fetch("/home/joinGame", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ game_id: game_id, user_2: this.user_id }),
            }).then((res) => res.json()).then((data) => {
                console.log("Game joined:", data);
                commit("setGameId", game.id);
                push(`/game/${game.id}`);
            });
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
    font-size: 3em;
    color: #333;
}
</style>