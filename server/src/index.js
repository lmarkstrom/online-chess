import betterLogging from "better-logging";
import express from "express";
import expressSession from "express-session";
import socketIOSession from "express-socket.io-session";
import { Server } from "socket.io";
import history from "connect-history-api-fallback";
import https from "https";
import fs from "fs";
import { resolvePath } from "./util.js";
import model from "./model.js";
import requireAuth from "./middleware/requireAuth.js";
import createGameController from "./controllers/game.controller.js";
import createUserController from "./controllers/user.controller.js";

const options = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost.pem"),
};

const port = 8989;
const app = express();
const server = https.createServer(options, app);
export const io = new Server(server);

export const TIMEOUT = 30000;

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

// Enable debug output
console.logLevel = 4;

// Register a custom middleware for logging incoming requests
app.use(
  betterLogging.expressMiddleware(console, {
    ip: { show: true, color: Theme.green.base },
    method: { show: true, color: Theme.green.base },
    header: { show: false },
    path: { show: true },
    body: { show: true },
  })
);

app.use(history());
app.use(express.static(resolvePath("client", "dist")));

// Configure session management
const sessionConf = expressSession({
  secret: "Super secret! Shh! Do not tell anyone...",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionConf);
io.use(
  socketIOSession(sessionConf, {
    autoSave: true,
    saveUninitialized: true,
  })
);

// Serve static files
app.use(express.static(resolvePath("client", "dist")));

// Register middlewares that parse the body of the request, available under req.body property
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controllers
app.use(createUserController(io, model).publicRouter);
app.use(createGameController(model).publicRouter);
app.use("/game", createUserController(io, model).publicRouter);
app.use("/home", createUserController(io, model).publicRouter);
app.use(
  "/home",
  requireAuth(model),
  createUserController(io, model).privateRouter
);
app.use("/home", requireAuth(model), createGameController(model).privateRouter);
app.use("/game", requireAuth(model), createGameController(model).privateRouter);

// Initialize a model
model.init(io, TIMEOUT);

export { model };

io.on("connection", (socket) => {
  const { session } = socket.handshake;
  const sessionID = session.id;
  let timeout;

  console.log("New socket connection for session:", sessionID);

  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      socket.emit("sessionTimeout");
      console.log("Session timed out:", sessionID);
      model.removeSession(sessionID);
      // socket.disconnect(true);
    }, TIMEOUT);
  };

  resetTimeout();

  socket.on("updateTime", () => {
    // console.log("Session updated");
    resetTimeout();
  });

  socket.on("logIn", ({ userID }) => {
    // console.log("User logged in:", userID);
    model.createSession(userID, sessionID);
    resetTimeout();
  });

  socket.on("disconnect", () => {
    clearTimeout(timeout);
  });
});

server.listen(port, () => {
  console.log(`Listening on https://localhost:${port}/`);
});
