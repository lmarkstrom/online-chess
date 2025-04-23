import { createStore } from "vuex";

export default createStore({
  state: {
    authenticated: false,
    username: "",
    user_id: "",
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
    }
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
    // setBooked(state, time){
    //   state.times[time.id].booked = true;
    //   state.times[time.id].booked_by = time.student;
    // }
  },
  actions: {},
  modules: {},
});
