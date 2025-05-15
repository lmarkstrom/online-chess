import { Router } from "express";
import model from "../model.js";
import db from "../db.js";
import pkg from "bcrypt";
import { io } from "../index.js";
const bcrypt = pkg;

const publicRouter = Router();
const privateRouter = Router();

publicRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const {id} = req.session;
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;
    let result = -1;
    if (!(regex.test(password) )) { // && regex.test(username)
        console.log("Invalid username or password");
        return;
    }
    const user = model.findUserByName(username);
    if (user !== undefined) {
        result = user.id;
    } else return res.status(401).send(String(-1));
    let rowRes = null;
    db.each("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
      if(row === undefined){
        console.log("User not found");
        return res.status(401).send(String(-1));
      }else {
        bcrypt.compare(password, row.password, async (err, result) => {
          if(!result){
            console.log("Password is incorrect");
            return res.status(401).send(String(-1));
          }else {
            model.createSession(user.id, id);
            return res.cookie("session-id", id).send(String(user.id));
          }
        });
      }
    });  
});

publicRouter.post("/logout", async (req, res) => {
    const { id } = req.session;
    model.removeSession(id);
    const socket = await io.fetchSockets();
    for (const s of socket) {
        if (s.handshake?.session?.id === id) {
            s.disconnect(true);
        }
    }
    res.clearCookie("session-id").send("ok");
});

publicRouter.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const {id} = req.session;
    
    const user = model.findUserByName(username);
    if (user !== undefined) {
        console.log("User already exists");
        return res.status(401).send(String(0));
    }
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      const statement = await db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
      statement.run(username, hash);
      statement.finalize();
      const userRes = await db.get("SELECT * FROM users WHERE username = ?", [username]);
      model.addUser(userRes.id, username);
      model.createSession(userRes.id, id);
      return res.cookie("session-id", id).json({ success: true, userId: userRes, username });
    });
});

export default { publicRouter, privateRouter };