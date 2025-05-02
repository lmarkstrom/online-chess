<template>
    <section class="container-fluid py-4">
      <div class="row">
        <div class="col">
            <h1>Join games</h1>
            <ul>
                <li>
                    Game 1: <a href="/game/1">Join</a>
                </li>
                <li>
                    Game 2: <a href="/game/2">Join</a>
                </li>
            </ul>
        </div>
        
        <div class="col">
            <h1>Options</h1>
            <div class="col">
                <h2>Create new Game</h2>
                <form @submit.prevent="createGame()">
                    <label for="gameName" class="form-label h4">Game Name</label>
                    <input
                        id="gameName"
                        v-model="gameName"
                        type="text"
                        class="form-control"
                        placeholder="Enter game name..."
                        required
                    />
                    <button type="submit" class="btn btn-dark mt-4 float-end">Create</button>
                </form>
            </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: "LoginView",
    components: {},
    data: () => ({
      username: "",
      user_id: null,
      open_games: [],
    }),
    methods: {
      async createGame() {
        console.log("Creates new game")
        await fetch("/game/openNewGame", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: user_id, username }),
        }).then((res) => res.json()).then((data) => {
          // TODO: SET GAME OPEN WAIT TO USER TO JOIN
        });
        push(getters.isAuthenticated === true ? "/admin" : "/login");
      },
    },
  };
  </script>