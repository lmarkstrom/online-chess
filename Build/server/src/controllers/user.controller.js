import { Router } from "express";
import model from "../model.js";

const publicRouter = Router();
const privateRouter = Router();

publicRouter.post("/login", (req, res) => {
    console.log("Login request");
    const { username, password } = req.body;
    const {id} = req.session;
    console.log(username);
    const regex = /^(?=.*[A-Za-z])(?=.*\d).{3,}$/;
    let result = 0;
    if (!(regex.test(password) && regex.test(username))) {
        console.log("Invalid username or password");
        return;
    }
    const user = model.findAssistantByName(username);
    if (user !== undefined) {
        result = user.id;
    }
    console.log(result);
    model.createSession(username, id);
    console.log("Session created" + model.session);
    res.cookie("session-id", id).send(String(result));
});

privateRouter.post("/logout", (req, res) => {
    const { username } = req.body;
    model.removeSession(username);
    res.clearCookie("session-id").send("ok");
});

export default { publicRouter, privateRouter };