<template>
  <section class="container-fluid py-4">
    <div v-if="user_2 === null" class="overlay">
      <div class="overlay-content">
        <p>Waiting for player 2…</p>
        <p><strong>Game ID:</strong> {{ game_id }}</p>
      </div>
    </div>
    <div v-if="winner !== null" class="overlay">
      <div class="overlay-content">
        <p>Game over, {{ winnerColor }}, wins!</p>
        <button class="btn btn-dark" type="button" @click="goHome()">
          Go to Home
        </button>
      </div>
    </div>
    <div v-if="user_2 !== null" class="top-info">
      <div class="info-content">
        <p><strong>Game ID:</strong> {{ game_id }}</p>
        <p></p>
        <p><strong>Your Color:</strong> {{ yourColor }}</p>
        <p></p>
        <p><strong>Turn:</strong> {{ turn }}</p>
      </div>
    </div>
    <div id="app">
      <div id="game">
        <div id="board" @keydown="emitUpdate()">
          <div
            v-for="(square, index) in board.flat()"
            :key="index"
            class="square"
            :style="getSquareStyle(Math.floor(index / 8), index % 8)"
            role="button"
            tabindex="0"
            @click="handleClick(Math.floor(index / 8), index % 8)"
            @keydown.enter="handleClick(Math.floor(index / 8), index % 8)"
            @keydown.space.prevent="
              handleClick(Math.floor(index / 8), index % 8)
            "
          >
            <img
              v-if="square && square.img"
              :src="square.img"
              :alt="square.name"
              class="piece"
            />
          </div>
        </div>
      </div>
      <div id="history">
        <h2>History</h2>
        <ul id="history-list">
          <li v-for="(move, index) in moveHistory" :key="index">
            {{ index + 1 }}. {{ move }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>

export default {
  name: "GameView",
  components: {},
  data: () => ({
    game_id: null,
    user_id: null,
    user_1: null,
    user_2: null,
    currentPlayer: null,
    winner: null,
    board: [],
    moveHistory: [],
    socket: null,
  }),
  computed: {
    yourColor() {
      if (this.user_id === this.user_1) return "White";
      if (this.user_id === this.user_2) return "Black";
      return "Unknown";
    },
    turn() {
      if (this.currentPlayer === "w") return "White";
      if (this.currentPlayer === "b") return "Black";
      return "Unknown";
    },
    winnerColor() {
      if (this.winner === "Black") return "White";
      if (this.winner === "White") return "Black";
      return "Unknown";
    },
    whoIsOpponent() {
      if (this.user_id === this.user_1) return this.user_2;
      if (this.user_id === this.user_2) return this.user_1;
      return "Unknown";
    },
  },
  mounted() {
    const { getters } = this.$store;
    this.game_id = this.$route.params.game_id;
    this.user_id = getters.getUserId;
    this.socket = getters.getSocket;
    console.log("Mount game: ", this.game_id);
    console.log("User ID:", this.user_id);
    this.fetchGame(this.game_id);
    socket.on("gameUpdate", (data) => {
      this.board = data.board;
      this.moveHistory = data.moveHistory;
      this.currentPlayer = data.currentPlayer;
      this.user_1 = data.user_1;
      this.user_2 = data.user_2;
    });
    this.emitUpdate();
    socket.on("sessionTimeout", () => {
      console.log("sessionTimeout");
      this.logout();
    });
    console.log(this.currentPlayer);
    console.log(this.turn);
    socket.on("gameOver", (msg) => {
      console.log("gameOver");
      console.log(msg.winner);
      this.winner = msg.winner;
    });
  },
  methods: {
    async fetchGame() {
      fetch(`/game/${this.game_id}/fetchGameData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ game_id: this.game_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          this.user_1 = data.user_1;
          this.user_2 = data.user_2;
          this.currentPlayer = data.currentPlayer;
          this.board = data.board;
          this.moveHistory = data.moveHistory;
          console.log("Game curr: ", this.currentPlayer);
          console.log("Game turn: ", this.turn);
          console.log("user_id: ", this.user_id);
          console.log("user_1: ", this.user_1);
          console.log("user_2: ", this.user_2);
          console.log("user_1: ", data.user_1);
          console.log("user_2: ", data.user_2);
        });
    },
    async handleClick(row, col) {
      this.emitUpdate();
      console.log("handleClick", row, col);
      const res = await fetch("/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game_id: this.game_id,
          row,
          col,
          user_id: this.user_id,
          opponent: this.whoIsOpponent,
          playerColor: this.yourPlayerColor,
        }),
      });
            const data = await res.json();
            this.board = data.board;
            this.moveHistory = data.moveHistory;
            this.currentPlayer = data.currentPlayer;

      const data = await res.json();
      this.board = data.board;
      this.moveHistory = data.moveHistory;
      this.currentPlayer = data.currentPlayer;
    },
    getSquareStyle(row, col) {
      const color = (row + col) % 2 === 0 ? "#eee" : "#444";
      return { backgroundColor: color };
    },
    emitUpdate() {
      console.log("emitUpdate");
      socket.emit("updateTime");
    },
    logout() {
      const { commit } = this.$store;
      const { push } = this.$router;
      fetch("/game/logout", {
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
    goHome() {
      const { push } = this.$router;
      push("/home");
    },
  },
};
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;


/* Main container */
#app {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
}

/* board */
#game {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgb(0 0 0 / 20%);
}

#board {
  display: grid;
  grid-template: repeat(8, 1fr) / repeat(8, 1fr);
  width: 500px;
  height: 500px;
  border: 4px solid #222;
  border-radius: 8px;
  overflow: hidden;
}

/* squares */
.square {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
}

.square:nth-child(odd) {
  background-color: #f0d9b5;
}

.square:nth-child(even) {
  background-color: #b58863;
}


.square.hoverable:hover {
  background-color: rgb(0 255 0 / 40%);
  cursor: pointer;
}

/* pieces */
.piece {
  width: 80%;
  height: 80%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
}

/* history */
#history {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgb(0 0 0 / 20%);
  width: 240px;
  max-height: 520px;
  overflow-y: auto;
}

#history h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  text-align: center;
}

#history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#history-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}

/* pop-up */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgb(0 0 0 / 75%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-content {
  background: #fff;
  padding: 2rem 3rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 20px rgb(0 0 0 / 40%);
  font-size: 1.25rem;
  color: #333;
}

.top-info {
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.top-info p {
  margin: 0 1rem;
}
</style>
