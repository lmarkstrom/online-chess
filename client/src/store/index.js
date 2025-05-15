import { createStore } from "vuex";

export default createStore({
  state: {
    authenticated: false,
    username: "",
    userID: "",
    gameID: null,
    opponent: null,
    times: [],
    curAssistantTime: {},
    socket: null,
  },
  getters: {
    isAuthenticated(state) {
      return state.authenticated;
    },
    getUsername(state) {
      return state.username;
    },
    getUserId(state) {
      return state.userID;
    },
    getOpponent(state) {
      return state.opponent;
    },
    getGameId(state) {
      return state.gameID;
    },
    getSocket(state) {
      return state.socket;
    },
  },
  mutations: {
    setAuthenticated(state, authenticated) {
      state.authenticated = authenticated;
    },
    setUsername(state, username) {
      state.username = username;
    },
    setUserId(state, userID) {
      state.userID = userID;
    },
    setGameId(state, gameID) {
      state.gameID = gameID;
    },
    setSocket(state, socket) {
      state.socket = socket;
    }

  },
  actions: {},
  modules: {},
});
