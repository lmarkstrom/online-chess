import { Router } from "express";
import model from "../model.js";
import db from "../db.js";
import pkg from "bcrypt";
const bcrypt = pkg;

const publicRouter = Router();
const privateRouter = Router();

publicRouter.post("/login", async (req, res) => {
    console.log("Login request");
    const { username, password } = req.body;
    const {id} = req.session;
    console.log(username);
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
    console.log("User found" + user);
    console.log(username + password);
  
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
            model.createSession(username, id);
            console.log("Session created" + model.sessions);
            return res.cookie("session-id", id).send(String(user.id));
          }
        });
      }
    });  
});

privateRouter.post("/logout", (req, res) => {
    const { username } = req.body;
    model.removeSession(username);
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
      model.addUser(id, username);
      model.createSession(username, id);
      return res.cookie("session-id", id).json({ success: true, userId: id, username });
    });
});

export default { publicRouter, privateRouter };