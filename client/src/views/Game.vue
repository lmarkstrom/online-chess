<template>
    <section class="container-fluid py-4">
        <div 
            id="app" 
            class="flex flex-row items-center justify-center gap-5"
        >
            <div 
                id="game"
                class="flex items-center justify-center bg-gray-100 w-[70%] max-w-[800px] max-h-[800px] aspect-square p-2.5 rounded-lg shadow-lg"
            > 
                <div 
                    id="board"
                    class="grid grid-cols-8 grid-rows-8 w-full h-full border-[5px] border-[#222]"
                >
                </div>
            </div>
            <div
                id="history"
                class="bg-white p-4 rounded-lg shadow-md w-[200px] h-[500px] overflow-y-auto"
            >
                <h2 class="text-center text-xl font-semibold mb-2">History</h2>
                <ul id="history-list" class="list-none p-0 m-0 space-y-1">
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
        boardHolder: document.getElementById("board")
    }),
    methods: {
        drawBoard() {
        boardHolder.innerHTML = ""; // clear board
        for(let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement("div");
                square.className = "square";
                square.dataset.row = i;
                square.dataset.col = j;
                square.style.backgroundColor = (i + j) % 2 === 0 ? "#eee" : "#444";
                square.addEventListener("click", () => this.handleUserClick(i, j));
                if (this.board[i][j] !== null) {
                    const img = document.createElement("img");
                    img.src = this.board[i][j].img;
                    img.alt = this.board[i][j].name;
                    img.className = "piece"; 
                    square.appendChild(img);
                }
                boardHolder.appendChild(square);
            }
        }
    }
    },
  };
  </script>