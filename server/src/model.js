import Users from "./models/user.model.js";
import db from "./db.js";

class Model {
  constructor() {
    this.timeslots = {};
    this.assistants = {};
    this.session = {};
    this.io = undefined;
  }

  async init(io) {
    this.io = io;
    // await db.each("SELECT * FROM assistants", (err, row) => {
    //   this.assistants[row.name] = new Users(row.name, row.id);
    // });
    // await db.each("SELECT * FROM timeslots", (err, row) => {
    //   this.timeslots[row.id] = new Timeslot(row.assistant_id, row.assistant_name, row.id, row.time, row.booked, row.booked_by);
    // });
    console.log(this.assistants);
    console.log(this.timeslots);
  }

  findAssistantByName(name) {
    return this.assistants[name];
  }

  createSession(username, id) {
    this.session[id] = {username: username, time: new Date()};
    console.log("Created session " + this.session);
    return id;
  }

  removeSession(username) {
    for (const id in this.session) {
      if (this.session[id].username === username) {
        delete this.session[id];
        console.log(this.session);
        return;
      }
    }
  }

  findSession(id){
    return this.session[id];
  }

  getTimeslots() {
    console.log(this.timeslots);
    return Object.values(this.timeslots);
  }

  createTimeslot(ass_id, ass_name, id, time) {
    this.timeslots[id] = new Timeslot(ass_id, ass_name, id, time, false, null);
  }

  bookTimeslot(id, student) {
    this.timeslots[id].booked = true;
    this.timeslots[id].booked_by = student;
  }

  removeTimeslot(times) {
    times.forEach(time => {
      delete this.timeslots[time.id];
    });
  }

  findAssistantById(id) {
    return this.assistants[id];
  }

  broadcastOn(id) {
    this.io.emit("tempBlock", {id: id});
  }

  broadcastOff(id) {
    this.io.emit("tempUnBlock", {id: id});
  }

  broadcastBooked(id, student){
    this.io.emit("booked", {id: id, student: student});
  }

  /**
   * Join a specified room.
   * @param {String} socketID - An unique identifier for the user socket.io session.
   * @param {Room} room - The room to join.
   * @returns {void}
   */
  join(socketId, room) {
    this.io.in(socketId).socketsJoin(room.name);
  }
}

export default new Model();
