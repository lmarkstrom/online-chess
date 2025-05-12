import { Router } from "express";
import pkg from "bcrypt";
import model from "../model.js";
import db from "../db.js";

const bcrypt = pkg;

const publicRouter = Router();
const privateRouter = Router();

publicRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const { id } = req.session;
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;
  if (!regex.test(password)) {
    // && regex.test(username)
    console.log("Invalid username or password");
    return;
  }
  const user = model.findUserByName(username);
  if (user === undefined) {
    res.status(401).send(String(-1));
  } else {
    db.each(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, row) => {
        if (row === undefined) {
          console.log("User not found");
          return res.status(401).send(String(-1));
        }
        try {
          const result = await bcrypt.compare(password, row.password);

          if (!result) {
            console.log("Password is incorrect");
            return res.status(401).send(String(-1));
          }

          model.createSession(username, id);
          console.log(`Session created${model.sessions}`);

          return res.cookie("session-id", id).send(String(user.id));
        } catch (error) {
          console.error("Error during password comparison", error);
          return res.status(500).send("Internal Server Error");
        }
      }
    );
  }
});

privateRouter.post("/logout", (req, res) => {
  const { username } = req.body;
  model.removeSession(username);
  res.clearCookie("session-id").send("ok");
});

publicRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { id } = req.session;

    const user = model.findUserByName(username);
    if (user !== null) {
      console.log("User already exists");
      return res.status(401).send(String(0));
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const statement = await db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)"
    );

    statement.run(username, hash);
    statement.finalize();

    model.addUser(id, username);
    model.createSession(username, id);

    return res
      .cookie("session-id", id)
      .json({ success: true, userId: id, username });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default { publicRouter, privateRouter };
