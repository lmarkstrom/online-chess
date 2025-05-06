<template>
    <section class="container-fluid py-4">
        <div v-if="user_2 === null" class="overlay">
            <div class="overlay-content">
                <p>Waiting for player 2…</p>
                <p><strong>Game ID:</strong> {{ game_id }}</p>
            </div>
        </div>
        <div id="app">
            <div id="game">
                <div id="board">
                    <div
                        v-for="(square, index) in board.flat()"
                        :key="index"
                        class="square"
                        :style="getSquareStyle(Math.floor(index / 8), index % 8)"
                        @click="handleClick(Math.floor(index / 8), index % 8)"
                    >
                        <img
                        v-if="square"
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
        board: [],
        moveHistory: [],
    }),
    mounted() {
        const { getters } = this.$store;
        this.user_id = getters.getUserId;
        this.user_1 = getters.getUsername;
        this.game_id = getters.getGameId;
        if(getters.getOpponent === null){
            this.fetchGame();
            // skapa lyssnare på att spelare joinar
        } {
            // joina match
        }
    },
    methods: {
        async fetchGame() {
            fetch(`/game/${this.game_id}/fetchGameData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ game_id: this.game_id}),
            }). then((res) => res.json()).then((data) => {
                this.currentPlayer = data.currentPlayer;
                this.user_2 = data.user_2;
                this.board = data.board;
                this.moveHistory = data.moveHistory;
            });
        },
        async handleClick(row, col) {
            const res = await fetch("/move", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            this.board = data.board;
            this.moveHistory = data.moveHistory;
        },
        getSquareStyle(row, col) {
            const color = (row + col) % 2 === 0 ? "#eee" : "#444";
            return { backgroundColor: color };
        },
    },
  };
</script>

<style scoped>
HTML, body {
    margin: 0;
    padding: 0;
}

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
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
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
.square:nth-child(odd) { background-color: #f0d9b5; }
.square:nth-child(even){ background-color: #b58863; }
.square.hoverable:hover {
  background-color: rgba(0, 255, 0, 0.4);
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
  box-shadow: 0 0 10px rgba(0,0,0,0.2);
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
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.75);
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
  box-shadow: 0 0 20px rgba(0,0,0,0.4);
  font-size: 1.25rem;
  color: #333;
}
</style>