import { createStore } from "vuex";

export default createStore({
  state: {
    authenticated: false,
    username: "",
    user_id: "",
    game_id: null,
    opponent: null,
    times: [],
    curAssistantTime: {},
  },
  getters: {
    isAuthenticated(state) {
      return state.authenticated;
    },
    getUsername(state) {
      return state.username;
    },
    getUserId(state) {
      return state.user_id;
    },
    getOpponent(state) {
      return state.opponent;
    },
    getGameId(state) {
      return state.game_id;
    },
  },
  mutations: {
    setAuthenticated(state, authenticated) {
      state.authenticated = authenticated;
    },
    setUsername(state, username) {
      state.username = username;
    },
    setUserId(state, user_id) {
      state.user_id = user_id;
    },
    setGameId(state, game_id) {
      state.game_id = game_id;
    }
  },
  actions: {},
  modules: {},
});
