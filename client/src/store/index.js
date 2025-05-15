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
    getUserID(state) {
      return state.userID;
    },
    getOpponent(state) {
      return state.opponent;
    },
    getGameID(state) {
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
    setUserID(state, userID) {
      state.userID = userID;
    },
    setGameID(state, gameID) {
      state.gameID = gameID;
    },
    setSocket(state, socket) {
      state.socket = socket;
    }

  },
  actions: {},
  modules: {},
});
