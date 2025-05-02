import { Router } from "express";
import model from "../model.js";
import db from "../db.js";

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
    } else return res.status(401).send(String(0));
    let rowRes = null;
    console.log("User found" + user);
    console.log(username + password);
    await db.each(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, row) => {
          if (row) {
            rowRes = 1;
          }
        }
    );
    if (rowRes === null) {
      console.log("User not found");
      return res.status(401).send(String(0));
    }
    model.createSession(username, id);
    console.log("Session created" + model.sessions);
    return res.cookie("session-id", id).send(String(result));
});

privateRouter.post("/logout", (req, res) => {
    const { username } = req.body;
    model.removeSession(username);
    res.clearCookie("session-id").send("ok");
});

export default { publicRouter, privateRouter };