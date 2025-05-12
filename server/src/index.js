import betterLogging from "better-logging";
import express from "express";
import expressSession from "express-session";
import socketIOSession from "express-socket.io-session";
import { createServer } from "http";
import { Server } from "socket.io";
import { resolvePath } from "./util.js";
import model from "./model.js";
import userController from "./controllers/user.controller.js";
import gameController from "./controllers/game.controller.js";
import { requireAuth } from "./middleware/requireAuth.js";
import history from "connect-history-api-fallback";

const port = 8989;
const app = express();
const server = createServer(app);
const io = new Server(server);

// export const game = new Chess();

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
app.use(userController.publicRouter);
app.use(gameController.publicRouter);
app.use("/home", requireAuth, userController.privateRouter);
app.use("/home", requireAuth, gameController.privateRouter);
app.use("/game", requireAuth, gameController.privateRouter);

// Initialize a model
model.init(io);


io.on("connection", (socket) => {
  const { session } = socket.handshake;
  let timeout;

  console.log("New socket connection");

  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      socket.emit("sessionTimeout");
    }, 100000);
  };

  resetTimeout();

  socket.on("updateTime", () => {
    console.log("Session updated");
    session.time = new Date();
    resetTimeout();
  });

  socket.on("disconnect", () => {
    clearTimeout(timeout);
  });
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`);
});
