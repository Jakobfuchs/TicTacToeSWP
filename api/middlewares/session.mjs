import { getItem, getSession } from "../database.mjs";

const authCookieName = "auth";
async function sessionMiddleware(ctx, next) {
  const authCookie = ctx.cookies.get(authCookieName);
  if (!authCookie) {
    ctx.body = "No auth cookie";
    ctx.status = 401;
    return;
  }

  const session = await getSession(authCookie);
  if (!session) {
    ctx.body = "Session not found";
    ctx.status = 401;
    return;
  }

  const user = await getItem("users", { id: session.userId });
  if (!user) {
    ctx.body = "User not found";
    ctx.status = 401;
    return;
  }
  ctx.user = user;
  await next();
}

export default sessionMiddleware;
