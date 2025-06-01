import { test as setup } from "@playwright/test";
import login from "../auth/login.json";
import fs from "fs";

setup("Authentication", async ({ request }) => {
  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: {
          email: "m_copy@abv.bg",
          password: "test1234",
        },
      },
    }
  );
  const responseBody = await response.json();
  const token = responseBody.user.token;

  login.origins[0].localStorage[0].value = token;

  fs.writeFileSync("./auth/login.json", JSON.stringify(login));

  process.env["ACCESS_TOKEN"] = token;
});
