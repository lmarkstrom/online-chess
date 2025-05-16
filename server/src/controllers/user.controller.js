import { Router } from "express";
import pkg from "bcrypt";
import { promisify } from "util";
import db from "../db.js";

const bcrypt = pkg;
const hashAsync = promisify(bcrypt.hash);

export default function createUserController(io, model) {
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

            model.createSession(row.id, id);

            return res.cookie("session-id", id).send(String(user.id));
          } catch (error) {
            console.error("Error during password comparison", error);
            return res.status(500).send("Internal Server Error");
          }
        }
      );
    }
  });

  publicRouter.post("/logout", async (req, res) => {
    const { id } = req.session;
    model.removeSession(id);
    const sockets = await io.fetchSockets();
    sockets.forEach((s) => {
      if (s.handshake?.session?.id === id) {
        s.disconnect(true);
      }
    });
    res.clearCookie("session-id").send("ok");
  });

  publicRouter.post("/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      const { id } = req.session;

      const user = model.findUserByName(username);
      console.log("User found", user);
      if (user !== undefined) {
        console.log("User already exists");
        return res.status(401).send(String(-1));
      }

      const saltRounds = 10;
      const hash = await hashAsync(password, saltRounds);

      const statement = await db.prepare(
        "INSERT INTO users (username, password) VALUES (?, ?)"
      );
      statement.run(username, hash);
      statement.finalize();

      const userRes = await db.get("SELECT * FROM users WHERE username = ?", [
        username,
      ]);
      model.addUser(userRes.id, username);
      model.createSession(userRes.id, id);

      return res
        .cookie("session-id", id)
        .json({ success: true, userId: userRes.id, username });
    } catch (error) {
      console.error("Error during registration", error);
      return res.status(500).send("Internal Server Error");
    }
  });

  return { publicRouter, privateRouter };
}
