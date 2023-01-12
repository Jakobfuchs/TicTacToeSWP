import Router from "koa-router";
import { getItem, putItem, queryItems, updateItem } from "../database.mjs";
import { sendMove } from "../server.mjs";

const router = new Router({ prefix: "/lobby" });

router.get("/newGame", async (ctx) => {
  if (!ctx.user) {
    return ctx.throw(401, "Unauthorized");
  }

  const game = {
    id: Date.now(),
    status: "waiting",
    players: JSON.stringify([ctx.user.id]),
    board: JSON.stringify(new Array(9).fill("")),
  };

  await putItem("lobbies", game);

  ctx.body = {
    gameId: game.id,
  };
});

router.get("/joinGame", async (ctx) => {
  if (!ctx.user) {
    return ctx.throw(401, "Unauthorized");
  }

  const openLobbies = await queryItems(
    "select * from lobbies where status = 'waiting'"
  );

  if (openLobbies.length === 0) {
    ctx.body = {
      gameId: null,
    };
  } else {
    const game = openLobbies[0];

    const opponent = JSON.parse(game.players)[0];

    await updateItem("lobbies", game.id, {
      players: JSON.stringify([opponent, ctx.user.id]),
      status: "playing",
    });

    const opponentItem = await getItem("users", { id: opponent });

    sendMove(opponentItem.id, JSON.parse(game.board));
    ctx.body = {
      gameId: game.id,
      opponent: opponentItem.email,
    };
  }
});

router.post("/move", async (ctx) => {
  if (!ctx.user) {
    return ctx.throw(401, "Unauthorized");
  }

  const { gameId, position } = ctx.request.body;

  const game = await getItem("lobbies", { id: gameId });

  if (!game) {
    return ctx.throw(404, "Game not found");
  }

  const players = JSON.parse(game.players);
  const board = JSON.parse(game.board);

  board[position] = players[0] === ctx.user.id ? "X" : "O";

  await updateItem("lobbies", gameId, {
    board: JSON.stringify(board),
  });

  const playerOne = await getItem("users", { id: players[0] });
  const playerTwo = await getItem("users", { id: players[1] });

  sendMove(players[0], board, ctx.user.id !== players[0], playerTwo.email);
  sendMove(players[1], board, ctx.user.id === players[0], playerOne.email);

  ctx.body = {
    success: true,
  };
});

export default router;
