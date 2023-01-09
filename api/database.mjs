import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./api/db.sqlite");

const tables = [
  {
    name: "users",
    columns: [
      {
        name: "id",
        type: "INTEGER PRIMARY KEY AUTOINCREMENT",
      },
      {
        name: "email",
        type: "TEXT",
      },
      {
        name: "password",
        type: "TEXT",
      },
    ],
  },
  {
    name: "sessions",
    columns: [
      {
        name: "id",
        type: "INTEGER PRIMARY KEY AUTOINCREMENT",
      },
      {
        name: "userId",
        type: "INTEGER",
      },
      {
        name: "token",
        type: "TEXT",
      },
      {
        name: "expires",
        type: "INTEGER",
      },
    ],
  },
];

export async function setup() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all(
        "select name from sqlite_master where type='table'",
        (err, rows) => {
          if (err) {
            reject(err);
            console.error(err);
          } else {
            for (const table of tables) {
              if (!rows.find((row) => row.name === table.name)) {
                const columns = table.columns
                  .map((column) => `${column.name} ${column.type}`)
                  .join(", ");
                console.log(
                  `Creating table ${table.name} with columns ${columns}`
                );
                db.run(`CREATE TABLE ${table.name} (${columns})`);
              }
            }
            resolve();
          }
        }
      );
    });
  });
}

export async function putItem(table, item) {
  const columns = Object.keys(item);
  const values = Object.values(item);
  const placeholders = columns.map(() => "?").join(", ");

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
        [...values],
        function (err) {
          if (err) {
            reject(err);
            console.error(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  });
}
export async function getItem(table, params) {
  const queryString = Object.keys(params)
    .map((key) => `${key} = ?`)
    .join(" AND ");
  const queryVars = Object.values(params);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        `SELECT * FROM ${table} WHERE ${queryString}`,
        [...queryVars],
        (err, row) => {
          if (err) {
            reject(err);
            console.error(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  });
}
export async function getSession(sessionCookie) {
  const session = await getItem("sessions", { token: sessionCookie });

  if (!session) {
    return null;
  }
  const expires = new Date(session.expires);
  console.log(expires);
  if (expires < new Date()) {
    return null;
  }
  return session;
}
export async function createSession(userId) {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const token = Math.random().toString(36).substring(2, 15);

  return putItem("sessions", {
    userId,
    token,
    expires,
  }).then(() => token);
}
export async function createUser(email, password) {
  const user = await getItem("users", { email });
  if (user) {
    return null;
  }
  return putItem("users", { email, password });
}
export async function userExists(email) {
  const user = await getItem("users", { email });
  return !!user;
}
export async function checkUserLogin(email, password) {
  const user = await getItem("users", { email, password });
  if (!user) {
    return null;
  }
  return user;
}
export async function removeUserSessions(userId) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM sessions WHERE userId = ?`, [userId], function (err) {
        if (err) {
          reject(err);
          console.error(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  });
}
