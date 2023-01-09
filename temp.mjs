import fetch from "node-fetch";

(async () => {
  let cookies = "";
  let url = "http://localhost:3001/user/";
  await fetch(url, {
    headers: {
      cookie: cookies,
    },
  }).then(async (response) => {
    console.log("1.", response.status, await response.text());
  });

  await fetch(url + "login", {
    method: "POST",
    body: JSON.stringify({ email: "my.email@gmail.com", password: "1234" }),
    headers: { "Content-Type": "application/json", cookie: cookies },
  }).then(async (response) => {
    const authCookie = response.headers.get("set-cookie");
    console.log("2.", response.status, await response.text());
    console.log({ authCookie });
    if (authCookie) {
      cookies = authCookie;
    }
  });
  await fetch(url + "register", {
    method: "POST",
    body: JSON.stringify({ email: "my.emailasd@gmail.com", password: "1234" }),
    headers: { "Content-Type": "application/json", cookie: cookies },
  }).then(async (response) => {
    const authCookie = response.headers.get("set-cookie");
    console.log("3.", response.status, await response.text());
    console.log({ authCookie });
    if (authCookie) {
      cookies = authCookie;
    }
  });
  await fetch(url, {
    method: "GET",
    headers: { cookie: cookies },
  }).then(async (response) => {
    console.log("4.", response.status, await response.text());
  });
})().then(() => console.log("Done"));
