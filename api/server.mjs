import koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { setup } from "./database.mjs";
import authRouter from "./routes/auth.mjs";
import userRouter from "./routes/user.mjs";
import sessionMiddleware from "./middlewares/session.mjs";
import logMiddleware from "./middlewares/log.mjs";

const app = new koa();
app.use(bodyParser());
app.use(logMiddleware);

const router = new Router({ prefix: "/api" });
router.use(authRouter.routes(), authRouter.allowedMethods());
router.use(sessionMiddleware);
router.use(userRouter.routes(), userRouter.allowedMethods());

app.use(router.routes(), router.allowedMethods());

setup().then(() => {
  app.listen(3001);
  console.log("App is listening on 3001");
});
