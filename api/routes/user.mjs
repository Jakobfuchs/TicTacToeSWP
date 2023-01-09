import Router from "koa-router";

const router = new Router({ prefix: "/user" });

router.get("/", async (ctx) => {
  if (ctx.user) {
    ctx.body = ctx.user;
  } else {
    ctx.status = 401;
  }
});

export default router;
