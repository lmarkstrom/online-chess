<template>
  <div class="home">
    <header>
      <h1 class="display-5">Welcome, {{ username }}!</h1>
    </header>
    <div class="row" @keydown="emitUpdate()">
      <h2 class="display-8 mb-4">Current win ratio: {{ winratio }}</h2>
      <div class="col-md-6 mb-4">
        <h1 class="display-5 mb-4">Join games</h1>
        <div v-if="open_games.length === 0" class="text-muted">
          No open games yet.
        </div>
        <div
          v-for="game in openGames"
          :key="game.id"
          class="card mb-3 shadow-sm"
        >
          <div class="card-body">
            <h5 class="card-title fw-bold">{{ game.game_name }}</h5>
            <p class="card-text mb-1">
              Host: <strong>{{ game.host }}</strong>
            </p>
            <p class="card-text mb-2">Status: {{ getStatus(game) }}</p>
            <button
              class="btn btn-outline-primary btn-sm"
              type="button"
              @click="joinGame(game.id)"
            >
              Join
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-4">
        <h2 class="display-6 mb-4">My games</h2>
        <div v-if="open_games.length === 0" class="text-muted">
          No own games
        </div>
        <div v-for="game in myGames" :key="game.id" class="card mb-3 shadow-sm">
          <div class="card-body">
            <h5 class="card-title fw-bold">{{ game.game_name }}</h5>
            <p class="card-text mb-1">
              Host: <strong>{{ game.host }}</strong>
            </p>
            <p class="card-text mb-2">Status: {{ getStatus(game) }}</p>
            <button
              class="btn btn-outline-primary btn-sm"
              type="button"
              @click="openGame(game.id)"
            >
              Open
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <h2 class="display-6 mb-4">Create new Game</h2>
        <form
          @submit.prevent="
            createGame();
            emitUpdate();
          "
        >
          <label for="gameName">Game Name:</label>
          <input
            id="gameName"
            v-model="game_name"
            type="text"
            class="form-control"
            placeholder="Enter game name..."
            required
          />
          <button type="submit" class="btn btn-dark float-end mt-2">
            Create
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";

const socket = io("http://localhost:8989");

export default {
  name: "HomePage",
  components: {},
  data: () => ({
    username: "",
    user_id: null,
    open_games: [],
    game_name: "",
    kickTimer: null,
    winratio: null,
  }),
  computed: {
    openGames() {
      return this.open_games.filter(
        (game) => game.user_2 === null && game.user_1 !== this.user_id
      );
    },
    myGames() {
      return this.open_games.filter(
        (game) => game.user_1 === this.user_id || game.user_2 === this.user_id
      );
    },
  },
  mounted() {
    const { getters } = this.$store;
    this.username = getters.getUsername;
    this.user_id = getters.getUserId;
    console.log("User ID:", this.user_id);
    this.fetchGames();
    this.fetchWinRatio();
    socket.on("gamelistUpdate", () => {
      this.$nextTick(() => {
        this.fetchGames();
      });
    });
    this.emitUpdate();
    socket.on("sessionTimeout", () => {
      console.log("sessionTimeout");
      this.logout();
    });
  },
  methods: {
    async fetchWinRatio() {
      console.log("Fetch win ratio");
      fetch("/home/fetchWinRatio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: this.user_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.winratio = `${(data.winRatio * 100).toFixed(2)}%`;
          console.log("Win ratio:", this.winratio);
        });
    },
    async fetchGames() {
      fetch("/home/fetchGames", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: this.user_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.open_games = data;
          console.log("Open games:", this.open_games);
        });
    },
    async createGame() {
      const { push } = this.$router;
      const { commit } = this.$store;
      console.log("Creates new game");
      console.log("Game name:", this.user_id);
      const id = await fetch("/home/newGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_1: this.user_id,
          username: this.username,
          game_name: this.game_name,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Game created:", data);
          return data.gameID;
        });
      commit("setGameId", id);
      push(`/game/${id}`);
    },
    getStatus(game) {
      if (game.user_2 === null) {
        return "Waiting for player 2...";
      }
      return "Game started!";
    },
    emitUpdate() {
      console.log("emitUpdate");
      socket.emit("updateTime");
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
      }).then((response) => {
        if (response.ok) {
          commit("setAuthenticated", false);
          console.log("Logout successful");
          push("/login");
        } else {
          console.error("Logout failed");
        }
      });
    },
    joinGame(gameID) {
      const { push } = this.$router;
      const { commit } = this.$store;
      fetch("/home/joinGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameID,
          user_id: this.user_id,
          username: this.username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Game joined:", data.success);
          commit("setGameId", gameID);
          push(`/game/${gameID}`);
        });
    },
    openGame(gameID) {
      const { push } = this.$router;
      const { commit } = this.$store;
      console.log("Open game:", gameID);
      commit("setGameId", gameID);
      push(`/game/${gameID}`);
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
