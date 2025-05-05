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
    addTime(state, newTime){
      state.times.push(newTime);
      state.times.sort((a, b) => 
        parseInt(a.time.replace(":","")) - parseInt(b.time.replace(":",""))
      );
    },
    removeTimes(state, times){
      state.times = state.times.filter((time) => !times.includes(time.id));
    },
    setAssistantTime(state, newAssistantTime){
      state.curAssistantTime = newAssistantTime;
    },
    setGameId(state, game_id) {
      state.game_id = game_id;
    }
    // setBooked(state, time){
    //   state.times[time.id].booked = true;
    //   state.times[time.id].booked_by = time.student;
    // }
  },
  actions: {},
  modules: {},
});
