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
    getTimes(state) {
      return state.times;
    },
    getAssistantTime(state) {
      return state.curAssistantTime;
    },
    getOpponent(state) {
      return state.opponent;
    },
    getGameId(state) {
      return state.gameID;
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
    addTime(state, newTime) {
      state.times.push(newTime);
      state.times.sort(
        (a, b) =>
          parseInt(a.time.replace(":", ""), 10) -
          parseInt(b.time.replace(":", ""), 10)
      );
    },
    removeTimes(state, times) {
      state.times = state.times.filter((time) => !times.includes(time.id));
    },
    setAssistantTime(state, newAssistantTime) {
      state.curAssistantTime = newAssistantTime;
    },
    setGameId(state, gameID) {
      state.gameID = gameID;
    },
    // setBooked(state, time){
    //   state.times[time.id].booked = true;
    //   state.times[time.id].booked_by = time.student;
    // }
  },
  actions: {},
  modules: {},
});
