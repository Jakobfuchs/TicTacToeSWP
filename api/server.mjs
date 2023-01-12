import koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { Server } from "socket.io";

import { setup } from "./database.mjs";
import authRouter from "./routes/auth.mjs";
import userRouter from "./routes/user.mjs";
import lobbyRouter from "./routes/lobby.mjs";
import sessionMiddleware from "./middlewares/session.mjs";
import logMiddleware from "./middlewares/log.mjs";

let socketIOServer;

export function sendMove(playerId, newBoard, canMove, opponent) {
  if (socketIOServer) {
    socketIOServer.emit(
      "move",
      JSON.stringify({ playerId, newBoard, canMove, opponent })
    );
  }
}

const app = new koa();
app.use(bodyParser());
app.use(logMiddleware);

const router = new Router({ prefix: "/api" });
router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(sessionMiddleware);
router.use(userRouter.routes(), userRouter.allowedMethods());
router.use(lobbyRouter.routes(), lobbyRouter.allowedMethods());

app.use(router.routes(), router.allowedMethods());

setup().then(() => {
  const server = app.listen(3001);
  console.log("App is listening on 3001");
  socketIOServer = new Server(server, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
});
