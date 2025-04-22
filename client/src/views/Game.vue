<template>
    <section class="container-fluid py-4">
        <div>
            <h1>Vue Chess</h1>
            <div class="board">
            <div
                v-for="(row, rowIndex) in board"
                :key="rowIndex"
                class="row"
            >
                <div
                v-for="(square, colIndex) in row"
                :key="colIndex"
                class="square"
                :style="getSquareStyle(rowIndex, colIndex)"
                @click="handleClick(rowIndex, colIndex)"
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

            <div>
            <h2>Move History</h2>
            <ul>
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
        board: [],
        moveHistory: [],
    }),
    mounted() {
        this.fetchGame();
    },
    methods: {
        async fetchGame() {
            const res = await fetch("/game");
            const data = await res.json();
            this.board = data.board;
            this.moveHistory = data.moveHistory;
        },
        async handleClick(row, col) {
            const res = await fetch("/move", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ row, col }),
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

<!-- <style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(8, 60px);
  grid-template-rows: repeat(8, 60px);
}
.square {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.piece {
  max-width: 100%;
  max-height: 100%;
}
</style> -->