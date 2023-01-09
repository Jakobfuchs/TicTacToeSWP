import Router from "koa-router";
import { checkUserLogin, removeUserSessions } from "../database.mjs";
import { userExists, createUser, createSession } from "../database.mjs";

const router = new Router({ prefix: "/auth" });

router.post("/register", async (ctx) => {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    ctx.body = "Email and password are required";
    ctx.status = 400;
    return;
  }

  if (await userExists(email)) {
    ctx.status = 400;
    ctx.body = "User already exists";
    return;
  }
  const user = await createUser(email, password);
  if (user) {
    const session = await createSession(user.id);
    ctx.cookies.set("auth", session);
    ctx.body = "Logged in";
  }
});

router.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;

  const user = await checkUserLogin(email, password);
  if (user) {
    const session = await createSession(user.id);
    ctx.cookies.set("auth", session);
    ctx.body = "Logged in";
  } else {
    ctx.body = "Invalid login";
    ctx.status = 401;
  }
});

router.post("/logout", async (ctx) => {
  const sessionCookie = ctx.cookies.get("auth");
  if (sessionCookie) {
    await removeUserSessions(sessionCookie).catch(() => {});
  }
  ctx.cookies.set("auth", "");
  ctx.body = "Logged out";
});
export default router;
